const path = require('path');

module.exports = function (options, output) {
		output.output = options.output || {filename: '[name]'};

		if (options.externals) {
			if ('n-ui' in options.externals) {
				const nUiEntry = path.join(process.cwd(), 'bower_components/n-ui/_entry');
				output.externals = Object.assign({}, options.externals, require(nUiEntry)(options.handleReact && options.usePreact));
			} else {
				output.externals = Object.assign({}, options.externals);
			}
		}

		if (options.entry) {
			output.entry = options.entry;
		}

		if (options.loaders) {
			output.module.loaders = output.module.loaders.concat(options.loaders);
		}
}
