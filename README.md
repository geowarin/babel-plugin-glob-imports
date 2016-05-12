# babel-plugin-glob-imports

[![Build Status](https://travis-ci.org/geowarin/babel-plugin-glob-imports.svg?branch=master)](https://travis-ci.org/geowarin/babel-plugin-glob-imports)

A babel plugin which allows you to import modules from glob expressions.

## Example

Before:

```javascript
import myModule from './src/**/*.js';
```

After:

```javascript
import * as one from './src/subdir/one.js';
import * as two from './src/subdir/otherdir/two.js';
const myModule = {
  one: one,
  two: two
}
```

## Limitations

This module is a bit opinionated:

* All files resolved by the glob must have unique names
* You can only use the global import with globs (Forbidden: `import {something} from "./glob/*.js"`)
