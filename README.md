# n-webpack
Build the webpack.config.js of your dreams :relaxed:

```
const nWebpack = require('@financial-times/n-webpack');
```
exports a function accepting the following options:

- `withBabelPolyfills`: default true - Includes babel's core-js polyfills in your js bundle
- `browsersList`: Array with browserslist-like values, used for autoprefixer targets 
```js
 default ['> 1%', 'last 2 versions', 'ie >= 9', 'ff ESR', 'bb >= 7', 'iOS >= 5]
```
- `entry`: Object used to configure webpack's entry points
- `includes|include`: Array of files/directories/globs to run babelifying over (in addition to ./client, ./shared, ./bower_components, which are included by default)
- `excludes|exclude`: Array of files/directories/globs to exclude from babelification
- `output`: options passed in to webpack output. default `{filename: '[name]'}`
- `env`: prod or dev, to force dev or prod build
- `outputStats`: a filename to output stats about the build to
- `babelPlugins`: Array of extra babel plugins to apply, e.g. `babelPlugins: ['transform-async-to-generator']`
