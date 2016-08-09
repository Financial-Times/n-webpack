const path = require('path');
const fs = require('fs')
function getBowerLinks () {
	return fs.readdirSync(path.join(process.cwd(), './bower_components')).filter(dir => {
		const stat = fs.lstatSync('./bower_components/' + dir);
		return stat.isSymbolicLink();
	})
}

module.exports = function (options, output) {
	if (!options.language || options.language === 'js') {
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

		es6Modules.concat(options.include || [])
			.concat(getBowerLinks())
			.forEach(path => babelConfig.include.push(new RegExp(path)));

		if (options.exclude) {
			options.exclude.forEach(
				path => babelConfig.exclude.push(new RegExp(path))
			);
		}

		if (options.withBabelPolyfills) {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-runtime'));
		} else {
			// this.config.resolve.alias = Object.assign(this.config.resolve.alias || {}, require('babel-polyfill-silencer/aliases'));
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-runtime'), {polyfill: false}]);
		}

		if (options.handleReact) {
			babelConfig.query.presets.push(require.resolve('babel-preset-react'))
		}

		if (options.ECMAScriptVersion <= 5) {
			babelConfig.query.presets.push(require.resolve('babel-preset-es2015'))
			babelConfig.query.plugins.push([require.resolve('babel-plugin-transform-es2015-classes'), { loose: true }])
		} else {
			babelConfig.query.plugins.push(require.resolve('babel-plugin-transform-es2015-modules-commonjs'));
			if (process.argv.indexOf('--dev') === -1) {
				babelConfig.compact = true;
			}
		}
		output.module.loaders.unshift(babelConfig);
	}
}
