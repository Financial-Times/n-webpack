const BowerWebpackPlugin = require('bower-webpack-plugin');
const path = require('path');

module.exports = function (options, output) {
	if (!options.language || options.language === 'js') {
		output.module.loaders = output.module.loaders.concat([
			// don't use requireText plugin (use the 'raw' plugin)
			{
				test: /follow-email\.js$/,
				loader: require.resolve('imports-loader'),
				query: 'requireText=>require'
			},
			{
				test: /\.html$/,
				loader: 'raw'
			}
		])
		output.plugins.push(
			new BowerWebpackPlugin({ includes: /\.js$/, modulesDirectories: path.resolve('./bower_components') })
		)
		output.resolveLoader.alias.raw = require.resolve('raw-loader');
 		output.resolveLoader.alias.imports = require.resolve('imports-loader');
	}
}
