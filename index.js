'use strict';

const path = require('path');
const packageJson = require(path.join(process.cwd(),'package.json'));

function AssetHashesPlugin() {
	const fs = require('fs');
	const crypto = require('crypto');

	return function () {
		this.plugin('done', stats => {
			const hashable = Object.keys(stats.compilation.assets)
				.filter(asset => !/\.map$/.test(asset))
				.map(fullPath => {
					const name = path.basename(fullPath);
					const file = fs.readFileSync(fullPath, 'utf8');
					const hash = crypto.createHash('sha1').update(file).digest('hex');
					const hashedName = `${hash.substring(0, 8)}/${name}`;

					return { name, hashedName };
				})
				.reduce((previous, current) => {
					previous[current.name] = current.hashedName;
					previous[current.name + '.map'] = current.hashedName + '.map';
					return previous;
				}, {});

			fs.writeFileSync('./public/asset-hashes.json', JSON.stringify(hashable, undefined, 2), { encoding: 'UTF8' });
		});
	};
}

function hasReact () {
	return packageJson.dependencies.react || packageJson.dependencies['preact-compat'];
}


class Configurator {
	constructor (options) {
		this.opts = options;
		this.depErrors = {
			prod: [],
			dev: []
		};
		this.checkDependencies();
		this.config = require('./config-base')();
	}

	checkDependencies () {
		this.checkDependency('webpack');
		this.checkDependency('extract-text-webpack-plugin');
		this.checkDependency('bower-webpack-plugin');
		this.checkDependency('autoprefixer');
		this.checkDependency('babel-loader');
		this.checkDependency('babel-plugin-add-module-exports', true);
		this.checkDependency('babel-plugin-transform-runtime', true);
		if (this.opts.withHeadCss) {
			this.checkDependency('extract-css-block-webpack-plugin');
		}
		const ECMAScriptVersion = ('ECMAScriptVersion' in this.opts) ? this.opts.ECMAScriptVersion : '5';

		if (ECMAScriptVersion <= 5) {
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

	outputDepErrors ()  {
		if (this.depErrors.prod.length) {
			console.error('Missing production dependencies')
			console.error(`Run \`npm install -S ${this.depErrors.prod.join(' ')}\``);
		}
		if (this.depErrors.dev.length) {
			console.error('Missing dev dependencies')
			console.error(`Run \`npm install -D ${this.depErrors.dev.join(' ')}\``);
		}

		if (this.depErrors.prod.length || this.depErrors.dev.length) {
			process.exit(2);
		}
	}

	exec () {

		this.config.output = this.opts.output || {filename: '[name]'};

		if (this.opts.externals) {
			if ('n-ui' in externals) {
				this.config.externals = Object.assign({}, this.opts.externals, require(path.join(process.cwd(), 'bower_components/n-ui/_entry')()));
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

		if (process.argv.indexOf('--dev') === -1) {
			const webpack = require('webpack');
			this.config.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
			this.config.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
			if (this.opts.withHashedAssets === true) {
				this.config.plugins.push(new AssetHashesPlugin());
			}
		}



// const enhancedEntryPoints = Object.assign({}, config.assets.entry);
// delete enhancedEntryPoints['./public/main-core.js'];
// const configs = [Object.assign({}, configBase, { entry: enhancedEntryPoints })];

// // if there's a `main-core.js` entry, create config for 'core' browsers
// // NOTE: bit hard-coded this. when the assets names/locations settle down, maybe make n-makefile.json not as explicit,
// // e.g. `css: ['main', 'ie8'], js: ['enhanced', 'core']
// const coreJsOutput = './public/main-core.js';
// const coreJsEntryPoint = config.assets.entry[coreJsOutput];
// if (coreJsEntryPoint) {
// 	const coreLoaders = configBase.module.loaders.slice();
// 	coreLoaders.unshift({
// 		test: /\.js$/,
// 		loader: require.resolve('es3ify-loader')
// 	});
// 	configs.push(Object.assign({}, configBase, {
// 		entry: { [coreJsOutput]: coreJsEntryPoint },
// 		module: { loaders: coreLoaders }
// 	}));
// }

// module.exports = configs;



	}

	setUpBabel(config, opts) {

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

		if (this.opts.assets.includes) {
			this.opts.assets.includes.forEach(
				path => babelConfig.include.push(new RegExp(path))
			);
		}


		if (this.opts.withBabelPolyfills) {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-runtime'));
		} else {
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-runtime'), {polyfills: false}]);
		}

		const handleReact = (withReact in this.opts) ? this.opts.withReact : hasReact();

		if (handleReact) {
			this.checkDependency('babel-preset-react', true);
			babelConfig.query.presets.push(require.resolve('babel-preset-react'))
		}

		const ECMAScriptVersion = (ECMAScriptVersion in this.opts) ? this.opts.ECMAScriptVersion : '5';

		if (ECMAScriptVersion <= 5) {
			babelConfig.query.presets.push(require.resolve('babel-preset-es2015'))
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }])
		}
		this.config.loaders.unshift(babelConfig);
	}
}

module.exports = function buildConfig(options) {
	return new Configurator(options).exec();
}
