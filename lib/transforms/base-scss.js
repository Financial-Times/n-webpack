const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = function (options, output) {
	if (!options.language || options.language === 'scss') {
		const extractOptions = [ 'css', 'postcss', 'sass'];

		if (options.cssVariant === 'ie8') {
			extractOptions.push('ie8SassOptions')
		}


		output.module.loaders = output.module.loaders.concat([
			// set 'this' scope to window
			{
				test: /cssrelpreload\.js$/,
				loader: require.resolve('imports-loader'),
				query: 'this=>window'
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract(extractOptions)
			}
		]);

		output.sassLoader = {
			sourcemap: true,
			includePaths: [ path.resolve('./bower_components') ],
			// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
			outputStyle: 'expanded'
		};

		output.cssLoader = (() => {
			if (process.argv.indexOf('--dev') === -1) {
				return {
					minimize: true,
					autoprefixer: false,
					sourceMap: true
				}
			} else {
				return {
					sourceMap: true
				}
			}
		})

		output.postcss = () => {
			return [ autoprefixer({
				browsers: ['> 1%', 'last 2 versions', 'ie >= 8', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
				flexbox: 'no-2009'
			}) ];
		};

		output.resolveLoader.alias.ie8SassOptions = path.join(__dirname, '../addons/ie8-sass-options');
		output.resolveLoader.alias.css = require.resolve('css-loader');
		output.resolveLoader.alias.postcss = require.resolve('postcss-loader');
		output.resolveLoader.alias.sass = require.resolve('sass-loader');

		output.plugins.push(
			new ExtractTextPlugin('[name]')
		)
	}
}
