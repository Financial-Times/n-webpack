# n-webpack
Build the webpack.config.js of your dreams :relaxed:

```
const nWebpack = require(@financial-times/n-webpack');
```
exports a function accepting the following options:

- `externals`:  map of requires not to bundle in this file, but rather to look for on the window object (see https://webpack.github.io/docs/library-and-externals.html). `{'n-ui': null}` will be automatically populated with paths to n-ui and its bundled-by-default components
- `withHeadCss`: default false - will split css into main.css and head.css files
- `withHashedAssets`: default false - will build a map of hashes for each generated file
- `withBabelPolyfills`: default true - Includes babel's core-js polyfills in your js bundle
- `ECMAScriptVersion`: default 5 - ES version to compile down to
- `withReact`: whether to proces bundle with babel-react etc. (if unspecified will try to guess from your package.json whether its' required)
- `entry`: Object used to configure webpack's entry points
- `includes|include`: Array of files/directories/globs to run babelifying over (in addition to ./client, ./shared, ./bower_components, which are included by default)
- `excludes|exclude`: Array of files/directories/globs to exclude from babelification
- `output`: options passed in to webpack output. default `{filename: '[name]'}`
- `wrap`: {before, after, options} strings to insert before and after the generated content. options is an optional object containing a regex `match` to select which output files to apply to
- `env`: prod or dev, to force dev or prod build
- `outputStats`: a filename to output stats about the build to


If `true` is passed in as the second parameter ana rray of webpack configs will be created, one for each of the growing number of asset variants required by next applications. To exclude certain variants (perhaps becaus eyour app takes care of building them itself) a `{exclude: []}` object can be passed in (see lib/variants.js for string values accepted in exclude)
