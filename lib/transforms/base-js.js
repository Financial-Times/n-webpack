const BowerWebpackPlugin = require('bower-webpack-plugin');
const path = require('path');

const handlebarsConfig = (extraHelperDirs) => {
	extraHelperDirs = extraHelperDirs.map(dir => path.resolve(dir));
	return {
		debug: false, // set to true to debug finding partial/helper issues
		extensions: ['.html'],
		helperDirs: [
			path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
			path.resolve('./server/helpers'),
			path.resolve('./node_modules/@financial-times/n-image/dist/handlebars-helpers'),
			path.resolve('./bower_components/n-concept/handlebars-helpers')
		].concat(extraHelperDirs),
		partialDirs: [path.resolve('./bower_components')]
	};
};

module.exports = function (options, output) {
	const extraHelperDirs = options.handlebarsHelpersDirs || [];
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
				loader: 'handlebars?' + JSON.stringify(handlebarsConfig(extraHelperDirs))
			}
		]);
		output.plugins.push(
			new BowerWebpackPlugin({ includes: /\.js$/, modulesDirectories: path.resolve('./bower_components') })
		);
	}
}
