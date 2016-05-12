import test from 'ava';
import { transform as babelTransform } from 'babel-core'

function transform (code) {
  return babelTransform(code, {
    babelrc: false,
    filename: 'glob-imports.js',
    sourceRoot: __dirname,
    plugins: ['../']
  }).code
}

test('should import globs - one level deep', t => {
  const code = 'import modules from "./fixtures/onelevel/*.js"';
  const result = transform(code);

  t.is(result, `import * as one from "./fixtures/onelevel/one.js";
import * as two from "./fixtures/onelevel/two.js";
const modules = {
  one: one,
  two: two
};`);
})
