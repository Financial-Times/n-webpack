const path =require('path');
module.exports = function (options, output) {
	output.devtool = 'source-map';
	output.resolve = {
		modules: [
			path.resolve('./bower_components'),
			path.resolve('./node_modules')
		]
	};

	output.module = {
		loaders: []
	};

	output.plugins = [];

	output.resolveLoader = {alias: {}};
}
