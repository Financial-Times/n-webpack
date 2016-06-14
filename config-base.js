const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = () => {
	return {
		devtool: 'source-map',
		module: {
			loaders: [
				// don't use requireText plugin (use the 'raw' plugin)
				{
					test: /follow-email\.js$/,
					loader: require.resolve('imports-loader'),
					query: 'requireText=>require'
				},
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
				},
				{
					test: /\.html$/,
					loader: 'raw'
				}
			]
		},

		sassLoader: {
			sourcemap: true,
			includePaths: [ path.resolve('./bower_components') ],
			// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
			outputStyle: 'expanded'
		},
		postcss: () => {
			return [ autoprefixer({
				browsers: ['> 1%', 'last 2 versions', 'ie >= 8', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
				flexbox: 'no-2009'
			}) ];
		},

		plugins: (() => {
			const plugins = [
				new BowerWebpackPlugin({ includes: /\.js$/, modulesDirectories: path.resolve('./bower_components') }),
				new ExtractTextPlugin('[name]'),
			];


			return plugins;
		})(),
		resolve: {
			root: [
				path.resolve('./bower_components'),
				path.resolve('./node_modules')
			],
			alias: (() => {
				if (packageJson.dependencies['preact-compat']) {
					return {
						'react': 'preact-compat',
						'react-dom': 'preact-compat'
					};
				}
			})()
		}
	};
}




		if (opts.withSass) {

		}



