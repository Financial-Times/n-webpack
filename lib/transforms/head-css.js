const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
module.exports = function (options, output) {
	if (options.withHeadCss) {
		output.plugins.push(new ExtractCssBlockPlugin())
	}
}
