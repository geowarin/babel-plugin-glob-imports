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

## DEVELOPMENT STOPPED

I did not continue developing this plugin because its tricky to update the glob.
Often, you just add files and you would like the glob to automatically list those files, which is not the case.
You have to delete babel cache or trigger a recompilation of the file where the glob is used.

For those reasons, I do not recommand using the plugin. Unless you can come up with some magic to make it work.
PRs welcome.
