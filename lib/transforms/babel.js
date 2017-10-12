const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const BowerResolvePlugin = require('bower-resolve-webpack-plugin');

function getBowerLinks() {
	try {
		return fs.readdirSync(path.join(process.cwd(), './bower_components')).filter(dir => {
			const stat = fs.lstatSync('./bower_components/' + dir);
			return stat.isSymbolicLink();
		});
	} catch (e) {
		return [];
	}
}

module.exports = (options, output) => {
	if (!options.language || options.language !== 'js') {
		return;
	}
	const babelConfig = {
		test: /\.js$/,
		loader: 'babel-loader',
		include: [
			/bower_components/,
			path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
			path.resolve('./server/helpers'), // more handlebars helpers
			path.resolve('./client'),
			path.resolve('./config'),
			path.resolve('./shared')
		],
		query: {
			babelrc: false, // ignore any .babelrc in project & dependencies
			cacheDirectory: true,
			plugins: [
				// Scope hoisting
				new webpack.optimize.ModuleConcatenationPlugin(),
				// This will handle a bower.json's `main` property being an array.
				new BowerResolvePlugin(),

				require.resolve('babel-plugin-add-module-exports', true),

				[
					require.resolve('babel-plugin-transform-runtime'),
					{
						polyfill: options.withBabelPolyfills || false,
					}
				],
			],
			presets: [
				[
					require.resolve('babel-preset-env'), {
						include: ['transform-es2015-classes'],
						targets: {
							browsers: options.browsers,
							loose: true
						}
					}
				],
				require.resolve('babel-preset-react')
			]
		}
	};

	// TODO: these modules need to be transpiled
	// NOTE: these are npm modules, babel has a freak out if you just include all of /node_modules/
	const es6Modules = [
		'@financial-times/n-email-article',
		'@financial-times/n-image',
		'@financial-times/n-myft-ui',
		'@financial-times/n-notification',
		'@financial-times/n-ui',
		'@financial-times/n-teaser',
		'@financial-times/n-counter-ad-blocking',
		'@financial-times/n-native-ads',
		'@financial-times/n-tourtip'
	];

	es6Modules
		.concat(options.include || options.includes || [])
		.concat(getBowerLinks())
		.forEach(path => babelConfig.include.push(new RegExp(path)));

	(options.exclude || options.excludes || [])
		.forEach(path => babelConfig.exclude.push(new RegExp(path)));

	if (options.babelPlugins) {
		babelConfig.query.plugins = babelConfig.query.plugins.concat(options.babelPlugins);
	}

	if (!options.withBabelPolyfills) {
		output.resolve.alias = Object.assign(output.resolve.alias || {}, require('babel-polyfill-silencer/aliases'));
	}

	output.module.loaders.unshift(babelConfig);
};
