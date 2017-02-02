const VerifyBuild = require('./lib/addons/verify-build');
const variants = require('./lib/variants');
const clone = require('clone');

// verify no wildcards used in /public/ ignore patterns
VerifyBuild.noWildcard();

const transforms = [
	require('./lib/transforms/tweak-options'),
	require('./lib/transforms/dependencies'),
	require('./lib/transforms/base'),
	require('./lib/transforms/base-js'),
	require('./lib/transforms/base-scss'),
	require('./lib/transforms/apply-simple-options'),
	require('./lib/transforms/babel'),
	require('./lib/transforms/head-css'),
	require('./lib/transforms/externals'),
	require('./lib/transforms/prod'),
	require('./lib/transforms/preact'),
	require('./lib/transforms/wrap'),
	require('./lib/transforms/verify'),
	require('./lib/transforms/stats')
];


function construct (options) {
	options = clone(options);
	const output = {};
	transforms.forEach(transform => {
		transform(options, output);
	})
	return output;
}

module.exports = function buildConfig (options, buildVariants) {
	if (buildVariants) {
		return variants(options, buildVariants).map(options => construct(options));
	} else {
		return construct(options);
	}
}
