const Wrap = require('../addons/wrap');
const semver = require('semver');

module.exports = function (options, output) {

	if (options.externals) {
		if ('n-ui' in options.externals) {
			const nUiEntry = path.join(process.cwd(), 'bower_components/n-ui/_entry');
			const nUiEntryPoints = require(nUiEntry)(options.handleReact && options.usePreact, options.nUiExcludes)
			output.externals = Object.assign({}, options.externals, nUiEntryPoints);
			output.plugins.push(
				new Wrap(
					'(function(){function init(){\n',
					'\n};window.ftNextnUiLoaded ? init() : document.addEventListener ? document.addEventListener(\'ftNextnUiLoaded\', init) : document.attachEvent(\'onftNextnUiLoaded\', init);})();',
					{ match: /\.js$/ }
				)
			);
		} else {
			output.externals = Object.assign({}, options.externals);
		}
	}
}
