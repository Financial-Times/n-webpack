const Wrap = require('../addons/wrap');

module.exports = function (options, output) {
	if (options.wrap) {
		output.plugins.push(
			new Wrap(
				options.wrap.before || '',
				options.wrap.after || '',
				options.wrap.options
			)
		);
	}
}
