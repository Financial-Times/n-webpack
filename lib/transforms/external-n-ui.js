const EntryWrap = require('../addons/entry-wrap');

module.exports = function (options, output) {
	if (options.externals && options.externals['n-ui']) {

		output.plugins.push(
			new EntryWrap(
				'(function(){function init(){\n',
				'\n};window.ftNextnUiLoaded ? init() : document.addEventListener ? document.addEventListener(\'ftNextnUiLoaded\', init) : document.attachEvent(\'onftNextnUiLoaded\', init);})();',
				{ match: /\.js$/ }
			)
		);
	}
}
