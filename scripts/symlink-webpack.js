const fs = require('fs');
const path = require('path');
const webpackPath = require.resolve('webpack').replace(/node_modules\/webpack\/.*/, 'node_modules/webpack/');
const webpackJson = require(path.join(webpackPath, 'package.json'));
const webpackExecutablePath = path.join(webpackPath, webpackJson.bin.webpack);
// process.cwd() in a npm install is the module itself - we want the top level application
const symlinkPath = path.join(process.cwd().split('node_modules')[0], 'node_modules/.bin/webpack');
if (!fs.existsSync(symlinkPath)) {
	fs.linkSync(webpackExecutablePath, symlinkPath)
}
