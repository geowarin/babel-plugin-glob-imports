import { dirname, basename, extname } from 'path';
import glob from 'glob';

export default function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration (path, file) {
        const { node: { specifiers, source } } = path

        if (!t.isStringLiteral(source) || !/\*/.test(source.value)) {
          return
        }

        const fromDir = dirname(file.file.opts.filename)
        const sources = glob.sync(source.value, {
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

        if (specifiers.length !== 1 || specifiers[0].type !== 'ImportDefaultSpecifier') {
          throw path.buildCodeFrameError('Glob imports only works with ')
        }

        const importName = specifiers[0].local.name;

        const makeImport = (localName, src) => t.importDeclaration([t.importNamespaceSpecifier(t.identifier(localName))], t.stringLiteral(src))
        const makeObject = (localName, members) => {
          const properties = members.map(member => t.objectProperty(t.identifier(member), t.identifier(member)))
          return t.variableDeclaration('const', [t.variableDeclarator(t.identifier(localName), t.objectExpression(properties))])
        }

        const newImports = sourcesWithNames.map(s => makeImport(s.name, s.src));
        const sourcesNames = sourcesWithNames.map(s => s.name);
        const replacements = [...newImports, makeObject(importName, sourcesNames)];

        path.replaceWithMultiple(replacements);
      }
    }
  }
};
