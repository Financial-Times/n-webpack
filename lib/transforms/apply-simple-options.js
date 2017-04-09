
module.exports = function (options, output) {
		output.output = options.output || {filename: '[name]'};

		if (options.entry) {
			output.entry = options.entry;
		}

		if (options.rules) {
			output.module.rules = output.module.rules.concat(options.rules);
		}
}
