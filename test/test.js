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
});

test('should import globs - nested dirs', t => {
  const code = 'import modules from "./fixtures/nested/**/*.js"';
  const result = transform(code);

  t.is(result, `import * as one from "./fixtures/nested/one.js";
import * as two from "./fixtures/nested/subdir/two.js";
const modules = {
  one: one,
  two: two
};`);
});

test('should throw in case of conflicts', t => {
  const code = 'import modules from "./fixtures/conflicts/**/*.js"';
  t.throws(
    attemptToTransform(code),
    checkError(`Found conflicting imports named "one" from glob ./fixtures/conflicts/**/*.js: ./fixtures/conflicts/one.js, ./fixtures/conflicts/subdir/one.js`)
  );
});

test('should throw default import is not used', t => {
  const code = 'import {module} from "./fixtures/oneleve/*.js"';
  t.throws(
    attemptToTransform(code),
    checkError(`Glob imports only works with default import. e.g.: import myModule from "src/*.js"`)
  );
});

function attemptToTransform (code) {
  return new Promise(resolve => resolve(transform(code)))
}

function checkError (msg) {
  const preface = 'glob-imports.js: '
  return err => err instanceof SyntaxError && err.message.slice(0, preface.length) === preface && err.message.slice(preface.length) === msg
}
