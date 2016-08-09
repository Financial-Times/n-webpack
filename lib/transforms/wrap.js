const EntryWrap = require('../addons/entry-wrap');

module.exports = function (options, output) {
	if (options.wrap) {
		output.plugins.push(
			new EntryWrap(
				options.wrap.before || '',
				options.wrap.after || '',
				options.wrap.options
			)
		);
	}
}
