const clone = require('clone');
const BROWSERSLIST = ['> 1%', 'last 2 versions', 'ie >= 9', 'ff ESR', 'bb >= 7', 'iOS >= 5'];

const transforms = [
	require('./lib/transforms/base'),
	require('./lib/transforms/apply-simple-options'),
	require('./lib/transforms/base-js'),
	//require('./lib/transforms/base-scss'),
	require('./lib/transforms/babel'),
	require('./lib/transforms/build-env'),
	require('./lib/transforms/stats')
];

module.exports = (options) => {
	options = clone(options);
	options.browsers = options.browsersList || BROWSERSLIST;
	options.ECMAScriptVersion = ('ECMAScriptVersion' in options) ? options.ECMAScriptVersion : 5;
	const output = {};
	transforms.forEach(transform => {
		transform(options, output);
	});
	output.resolve.alias = output.resolve.alias = Object.assign(output.resolve.alias || {}, {
		'react': 'preact-compat',
		'react-dom': 'preact-compat'
	});
	console.log(output);
	return output;
};
