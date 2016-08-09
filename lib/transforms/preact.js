module.exports = function (options, output) {
	if (options.handleReact && options.usePreact) {
		output.resolve.alias = output.resolve.alias = Object.assign(output.resolve.alias || {}, {
			'react': 'preact-compat',
			'react-dom': 'preact-compat'
		});
	}

}
