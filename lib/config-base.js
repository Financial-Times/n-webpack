const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = language => {
	const base = {
		devtool: 'source-map',
		plugins: [
			new BowerWebpackPlugin({ includes: /\.js$/, modulesDirectories: path.resolve('./bower_components') }),
			new ExtractTextPlugin('[name]'),
		],

		resolve: {
			root: [
				path.resolve('./bower_components'),
				path.resolve('./node_modules')
			]
		},
		module: {
			loaders: []
		}
	}

	if (!language || language === 'js') {
		base.module.loaders = [
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
		]
	}

	if (!language || language === 'scss') {
		base.module.loaders = base.module.loaders.concat([
			// set 'this' scope to window
			{
				test: /cssrelpreload\.js$/,
				loader: require.resolve('imports-loader'),
				query: 'this=>window'
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract(
					process.argv.indexOf('--dev') === -1
						? [ 'css?minimize&-autoprefixer&sourceMap', 'postcss', 'sass' ]
						: [ 'css?sourceMap', 'postcss', 'sass' ]
				)
			}
		]);
		base.sassLoader = {
			sourcemap: true,
			includePaths: [ path.resolve('./bower_components') ],
			// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
			outputStyle: 'expanded'
		};
		base.postcss = () => {
			return [ autoprefixer({
				browsers: ['> 1%', 'last 2 versions', 'ie >= 8', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
				flexbox: 'no-2009'
			}) ];
		};

	}

	return base;

}
