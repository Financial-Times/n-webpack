'use strict';
const path = require('path');
const packageJson = require(path.join(process.cwd(),'package.json'));
const EntryWrap = require('./addons/entry-wrap');
const AssetHashes = require('./addons/asset-hashes');
const VerifyBuild = require('./addons/verify-build');
const protips = require('protips');
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const fs = require('fs');

const protipsPaths = [path.join(__dirname, '../PROTIPS.md')];
const nUiProtipsPath = path.join(process.cwd(), 'bower_components/n-ui', 'PROTIPS.md');
if (require('fs').existsSync(nUiProtipsPath)) {
	protipsPaths.push(nUiProtipsPath);
}

protips.apply(protips, protipsPaths);

VerifyBuild.noWildcard();

function hasReact () {
	return !!(packageJson.dependencies && (packageJson.dependencies.react || packageJson.dependencies['preact-compat']));
}

function hasPreact () {
	return !!(packageJson.dependencies && packageJson.dependencies['preact-compat']);
}

function getBowerLinks ()  {
	return fs.readdirSync(path.join(process.cwd(), './bower_components')).filter(dir => {
		const stat = fs.lstatSync('./bower_components/' + dir);
		return stat.isSymbolicLink();
	})
}


class Configurator {
	constructor (options) {
		this.opts = options;

		// backwards compatible with our pluralised properties
		// but prefers webpack's non-plural property names
		this.opts.exclude = this.opts.exclude || this.opts.excludes;
		this.opts.include = this.opts.include || this.opts.includes;

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
				this.config.externals = Object.assign({}, this.opts.externals, require(nUiEntry)(this.handleReact && hasPreact()));
			} else {
				this.config.externals = Object.assign({}, this.opts.externals);
			}
		}

		if (this.opts.entry) {
			this.config.entry = this.opts.entry;
		}

		if (this.opts.loaders) {
			this.config.module.loaders = this.config.module.loaders.concat(this.opts.loaders);
		}

		this.setUpBabel();

		if (this.opts.withHeadCss) {
			const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
			this.config.plugins.push(new ExtractCssBlockPlugin())
		}

		if (this.opts.externals && this.opts.externals['n-ui']) {

			this.config.plugins.push(
				new EntryWrap(
					'(function(){function init(){\n',
					'\n};window.ftNextnUiLoaded ? init() : document.addEventListener ? document.addEventListener(\'ftNextnUiLoaded\', init) : document.attachEvent(\'onftNextnUiLoaded\', init);})();',
					{ match: /\.js$/ }
				)
			);
		}

		if (process.argv.indexOf('--dev') === -1 || ('env' in this.opts && this.opts.env === 'prod')) {
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
			this.config.resolve.alias = this.config.resolve.alias = Object.assign(this.config.resolve.alias || {}, {
				'react': 'preact-compat',
				'react-dom': 'preact-compat'
			});
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

		if (this.opts.outputStats) {
			this.config.plugins.push(new StatsWriterPlugin({
				filename: this.opts.outputStats,
				fields: null
			}));
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
			exclude: [],
			query: {
				cacheDirectory: true,
				plugins: [
					require.resolve('babel-plugin-add-module-exports', true)
				],
				presets: []
			}
		};

		// TODO: these modules need to be transpiled
		// NOTE: these are npm modules, babel has a freak out if you just include all of /node_modules/
		const es6Modules = [
			'@financial-times/n-card',
			'@financial-times/n-image',
			'@financial-times/n-section',
			'@financial-times/n-ui'
		];

		es6Modules.concat(this.opts.include || [])
			.concat(getBowerLinks())
			.forEach(path => babelConfig.include.push(new RegExp(path)));

		if (this.opts.exclude) {
			this.opts.exclude.forEach(
				path => babelConfig.exclude.push(new RegExp(path))
			);
		}

		if (this.opts.withBabelPolyfills) {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-runtime'));
		} else {
			// this.config.resolve.alias = Object.assign(this.config.resolve.alias || {}, require('babel-polyfill-silencer/aliases'));
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
