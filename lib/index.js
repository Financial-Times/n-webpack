'use strict';
const path = require('path');
const packageJson = require(path.join(process.cwd(),'package.json'));
const EntryWrap = require('./addons/entry-wrap');
const AssetHashes = require('./addons/asset-hashes');
const VerifyBuild = require('./addons/verify-build');

VerifyBuild.noWildcard();

function hasReact () {
	return packageJson.dependencies.react || packageJson.dependencies['preact-compat'];
}

function hasPreact () {
	return packageJson.dependencies['preact-compat'];
}


class Configurator {
	constructor (options) {
		this.opts = options;
		this.handleReact = ('withReact' in this.opts) ? this.opts.withReact : hasReact();
		this.ECMAScriptVersion = ('ECMAScriptVersion' in this.opts) ? this.opts.ECMAScriptVersion : 5;
		this.depErrors = {
			prod: [],
			dev: []
		};
		this.checkDependencies();
		this.config = require('./config-base')();
	}

	checkDependencies () {
		this.checkDependency('babel-plugin-add-module-exports', true);
		this.checkDependency('babel-plugin-transform-runtime', true);
		if (this.handleReact) {
			this.checkDependency('babel-preset-react', true);
		}


		if (this.ECMAScriptVersion <= 5) {
			this.checkDependency('babel-preset-es2015', true);
			this.checkDependency('babel-plugin-transform-es2015-classes', true);
		}
		this.outputDepErrors();
	}

	checkDependency (name, isProd) {
		try {
			require.resolve(name);
		} catch (e) {
			if (e.code === 'MODULE_NOT_FOUND') {
				this.depErrors[isProd ? 'prod' : 'dev'].push(name)
			}
		}
	}

	outputDepErrors () {
		if (this.depErrors.prod.length) {
			console.error('Missing production dependencies'); //eslint-disable-line
			console.error(`Run \`npm install -S ${this.depErrors.prod.join(' ')}\``); //eslint-disable-line
		}
		if (this.depErrors.dev.length) {
			console.error('Missing dev dependencies'); //eslint-disable-line
			console.error(`Run \`npm install -D ${this.depErrors.dev.join(' ')}\``); //eslint-disable-line
		}

		if (this.depErrors.prod.length || this.depErrors.dev.length) {
			process.exit(2);
		}
	}

	exec () {

		this.config.output = this.opts.output || {filename: '[name]'};

		if (this.opts.externals) {
			if ('n-ui' in this.opts.externals) {
				const nUiEntry = path.join(process.cwd(), 'bower_components/n-ui/_entry');
				this.config.externals = Object.assign({}, this.opts.externals, require(nUiEntry)());
			} else {
				this.config.externals = Object.assign({}, this.opts.externals);
			}
		}

		if (this.opts.entry) {
			this.config.entry = this.opts.entry;
		}

		this.setUpBabel();

		if (this.opts.withHeadCss) {
			const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
			this.config.plugins.push(new ExtractCssBlockPlugin({ match: /main\.css$/ }))
		}

		if (this.opts.externals && this.opts.externals['n-ui']) {

			this.config.plugins.push(
				new EntryWrap(
					'(function(){function init(){\n',
					'\n};window.ftNextnUiLoaded ? init() : document.addEventListener(\'ftNextnUiLoaded\', init);})();',
					{ match: /public\/main\.js$/ }
				)
			);
		}

		if (process.argv.indexOf('--dev') === -1) {
			const webpack = require('webpack');
			this.config.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
			if (this.ECMAScriptVersion <= 5) {
				this.config.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
			}
			if (this.opts.withHashedAssets === true) {
				this.config.plugins.push(new AssetHashes());
			}
		}

		if (this.handleReact && hasPreact()) {
			this.config.resolve.alias = {
				'react': 'preact-compat',
				'react-dom': 'preact-compat'
			};
		}

		// The following two steps must come last
		if (this.opts.wrap) {
			this.config.plugins.push(
				new EntryWrap(
					this.opts.wrap.before || '',
					this.opts.wrap.after || '',
					this.opts.wrap.options
				)
			);
		}

		if (process.argv.indexOf('--dev') === -1) {
			this.config.plugins.push(new VerifyBuild('prod'));
		} else {
			this.config.plugins.push(new VerifyBuild('dev'));
		}

		return this.config;
	}

	setUpBabel () {

		const babelConfig = {
			test: /\.js$/,
			loader: require.resolve('babel-loader'),
			include: [
				/bower_components/,
				path.resolve('./client'),
				path.resolve('./config'),
				path.resolve('./shared')
			],
			query: {
				cacheDirectory: true,
				plugins: [
					require.resolve('babel-plugin-add-module-exports', true)
				],
				presets: []
			}
		};

		if (this.opts.includes) {
			this.opts.includes.forEach(
				path => babelConfig.include.push(new RegExp(path))
			);
		}

		if (this.opts.withBabelPolyfills) {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-runtime'));
		} else {
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-runtime'), {polyfill: false}]);
		}

		if (this.handleReact) {
			this.checkDependency('babel-preset-react', true);
			babelConfig.query.presets.push(require.resolve('babel-preset-react'))
		}

		if (this.ECMAScriptVersion <= 5) {
			babelConfig.query.presets.push(require.resolve('babel-preset-es2015'))
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }])
		} else {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-es2015-modules-commonjs'));
			if (process.argv.indexOf('--dev') === -1) {
				babelConfig.compact = true;
			}
		}

		this.config.module.loaders.unshift(babelConfig);
	}
}

module.exports = function buildConfig (options) {
	return new Configurator(options).exec();
}
