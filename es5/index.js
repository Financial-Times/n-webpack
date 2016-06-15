'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var packageJson = require(path.join(process.cwd(), 'package.json'));
var EntryWrap = require('./addons/entry-wrap');
var AssetHashes = require('./addons/asset-hashes');

function hasReact() {
	return packageJson.dependencies.react || packageJson.dependencies['preact-compat'];
}

function hasPreact() {
	return packageJson.dependencies['preact-compat'];
}

var Configurator = function () {
	function Configurator(options) {
		_classCallCheck(this, Configurator);

		this.opts = options;
		this.handleReact = 'withReact' in this.opts ? this.opts.withReact : hasReact();
		this.ECMAScriptVersion = 'ECMAScriptVersion' in this.opts ? this.opts.ECMAScriptVersion : '5';
		this.depErrors = {
			prod: [],
			dev: []
		};
		this.checkDependencies();
		this.config = require('./config-base')();
	}

	_createClass(Configurator, [{
		key: 'checkDependencies',
		value: function checkDependencies() {
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
	}, {
		key: 'checkDependency',
		value: function checkDependency(name, isProd) {
			try {
				require.resolve(name);
			} catch (e) {
				if (e.code === 'MODULE_NOT_FOUND') {
					this.depErrors[isProd ? 'prod' : 'dev'].push(name);
				}
			}
		}
	}, {
		key: 'outputDepErrors',
		value: function outputDepErrors() {
			if (this.depErrors.prod.length) {
				console.error('Missing production dependencies'); //eslint-disable-line
				console.error('Run `npm install -S ' + this.depErrors.prod.join(' ') + '`'); //eslint-disable-line
			}
			if (this.depErrors.dev.length) {
				console.error('Missing dev dependencies'); //eslint-disable-line
				console.error('Run `npm install -D ' + this.depErrors.dev.join(' ') + '`'); //eslint-disable-line
			}

			if (this.depErrors.prod.length || this.depErrors.dev.length) {
				process.exit(2);
			}
		}
	}, {
		key: 'exec',
		value: function exec() {

			this.config.output = this.opts.output || { filename: '[name]' };

			if (this.opts.externals) {
				if ('n-ui' in this.opts.externals) {
					var nUiEntry = path.join(process.cwd(), 'bower_components/n-ui/_entry');
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
				var ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
				this.config.plugins.push(new ExtractCssBlockPlugin({ match: /main\.css$/ }));
			}

			if (this.opts.externals && this.opts.externals['n-ui']) {

				this.config.plugins.push(new EntryWrap('(function(){function init(){\n', '\n};window.ftNextnUiLoaded ? init() : document.addEventListener(\'ftNextnUiLoaded\', init);})();', { match: /public\/main\.js$/ }));
			}

			if (process.argv.indexOf('--dev') === -1) {
				var webpack = require('webpack');
				this.config.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
				this.config.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
				if (this.opts.withHashedAssets === true) {
					this.config.plugins.push(new AssetHashes());
				}
			}

			if (this.opts.wrap) {
				this.config.plugins.push(new EntryWrap(this.opts.wrap.before || '', this.opts.wrap.after || '', this.opts.wrap.options));
			}

			if (this.handleReact && hasPreact()) {
				this.config.resolve.alias = {
					'react': 'preact-compat',
					'react-dom': 'preact-compat'
				};
			}

			return this.config;
		}
	}, {
		key: 'setUpBabel',
		value: function setUpBabel() {

			var babelConfig = {
				test: /\.js$/,
				loader: require.resolve('babel-loader'),
				include: [/bower_components/, path.resolve('./client'), path.resolve('./config'), path.resolve('./shared')],
				query: {
					cacheDirectory: true,
					plugins: [require.resolve('babel-plugin-add-module-exports', true)],
					presets: []
				}
			};

			if (this.opts.includes) {
				this.opts.includes.forEach(function (path) {
					return babelConfig.include.push(new RegExp(path));
				});
			}

			if (this.opts.withBabelPolyfills) {
				babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-runtime'));
			} else {
				babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-runtime'), { polyfill: false }]);
			}

			if (this.handleReact) {
				this.checkDependency('babel-preset-react', true);
				babelConfig.query.presets.push(require.resolve('babel-preset-react'));
			}

			if (this.ECMAScriptVersion <= 5) {
				babelConfig.query.presets.push(require.resolve('babel-preset-es2015'));
				babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }]);
			}
			this.config.module.loaders.unshift(babelConfig);
		}
	}]);

	return Configurator;
}();

module.exports = function buildConfig(options) {
	return new Configurator(options).exec();
};