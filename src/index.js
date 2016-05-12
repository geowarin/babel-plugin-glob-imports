import { dirname, basename, extname } from 'path';
import glob from 'glob';

function ensureNamesUniqueness(sourcesWithNames, path, globValue) {
  const srcByNames = {};
  for (const src of sourcesWithNames) {
    srcByNames[src.name] = (srcByNames[src.name] || []).concat(src);
  }
  for (const name of Object.keys(srcByNames)) {
    if (srcByNames[name].length > 1) {
      const paths = srcByNames[name].map(s => s.src).join(', ');
      throw path.buildCodeFrameError(`Found conflicting imports named "${name}" from glob ${globValue}: ${paths}`)
    }
  }
}

export default function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration (path, file) {
        const { node: { specifiers, source } } = path

        if (!t.isStringLiteral(source) || !/\*/.test(source.value)) {
          return
        }

        const globValue = source.value;
        const fromDir = dirname(file.file.opts.filename)
        const sources = glob.sync(globValue, {
          cwd: fromDir,
          strict: true
        });
        const sourcesWithNames = sources.map(source => {
          const ext = extname(source);
          return {
            src: source,
            name: basename(source, ext)
          };
        });
        ensureNamesUniqueness(sourcesWithNames, path, globValue);

        const sourcesNames = sourcesWithNames.map(s => s.name);

        if (specifiers.length !== 1 || specifiers[0].type !== 'ImportDefaultSpecifier') {
          throw path.buildCodeFrameError('Glob imports only works with default import. e.g.: import myModule from "src/*.js"')
        }

        const importName = specifiers[0].local.name;

        const makeImport = (localName, src) => t.importDeclaration([t.importNamespaceSpecifier(t.identifier(localName))], t.stringLiteral(src))
        const makeObject = (localName, members) => {
          const properties = members.map(member => t.objectProperty(t.identifier(member), t.identifier(member)))
          return t.variableDeclaration('const', [t.variableDeclarator(t.identifier(localName), t.objectExpression(properties))])
        }

        const newImports = sourcesWithNames.map(s => makeImport(s.name, s.src));
        const replacements = [...newImports, makeObject(importName, sourcesNames)];

        path.replaceWithMultiple(replacements);
      }
    }
  }
};
