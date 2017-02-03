'use strict';

const path = require('path');
const VerifyBuild = require('./lib/addons/verify-build');
const variants = require('./lib/variants');
const protips = require('protips');
const protipsPaths = [path.join(__dirname, 'PROTIPS.md')];
const clone = require('clone');
const tweakOptions = require('./lib/transforms/tweak-options');
const checkDependencies = require('./lib/transforms/dependencies');

protips.apply(protips, protipsPaths);

// verify no wildcards used in /public/ ignore patterns
VerifyBuild.noWildcard();


const transforms = [
	require('./lib/transforms/base'),
	require('./lib/transforms/apply-simple-options'),
	require('./lib/transforms/base-js'),
	require('./lib/transforms/base-scss'),
	require('./lib/transforms/babel'),
	require('./lib/transforms/head-css'),
	require('./lib/transforms/externals'),
	// require('./lib/transforms/prod'),
	// require('./lib/transforms/preact'),
	// require('./lib/transforms/wrap'),
	// require('./lib/transforms/verify'),
	// require('./lib/transforms/stats')
];

function construct (options) {
	options = clone(options);
	tweakOptions(options);
	checkDependencies(options);
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
