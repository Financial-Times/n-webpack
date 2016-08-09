const webpack = require('webpack');
const AssetHashes = require('../addons/asset-hashes');

module.exports = function (options, output) {
	if (process.argv.indexOf('--dev') === -1 || ('env' in options && options.env === 'prod')) {

		output.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
		if (this.ECMAScriptVersion <= 5) {
			output.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
		}
		if (options.withHashedAssets === true) {
			output.plugins.push(new AssetHashes());
		}
	}
}
