# n-webpack
Build the webpack.config.js of your dreams :relaxed:

```
const nWebpack = require(@financial-times/n-webpack');
```
exports a function accepting the following options:

- `externals`:  map of requires not to bundle in this file, but rather to look for on the window object (see https://webpack.github.io/docs/library-and-externals.html). `{'n-ui': null}` will be automatically populated with paths to n-ui and its bundled-by-default components
- `withHeadCss`: default false - will split css into main.css and head.css files
- `withHashedAssets`: default false - will build a map of hashes for each generated file
- `withBabelPolyfills`: default true - Includes babel's core-js polyfills in oyur js bunlde
- `entry`: Object used to configure webpack's entry points
- `includes`: Array of files/directories/globs to run babelifying over (in addition to ./client, ./shared, ./bower_components, which are included by default)

