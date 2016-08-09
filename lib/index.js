'use strict';

const path = require('path');
const VerifyBuild = require('./addons/verify-build');
const protips = require('protips');
const protipsPaths = [path.join(__dirname, '../PROTIPS.md')];
const nUiProtipsPath = path.join(process.cwd(), 'bower_components/n-ui', 'PROTIPS.md');

if (require('fs').existsSync(nUiProtipsPath)) {
	protipsPaths.push(nUiProtipsPath);
}

protips.apply(protips, protipsPaths);

// verify no wildcards used in /public/ ignore patterns
VerifyBuild.noWildcard();

function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
}

function filterEntryKeys (obj, rx, suffix) {
	const keys = Object.keys(obj).filter(key => rx.test(key))
	return keys.reduce((o, key) => {
		o[key.replace(rx, suffix)] = obj[key]
		return o;
	}, {})
}

const transforms = [
	require('./transforms/tweak-options'),
	require('./transforms/dependencies'),
	require('./transforms/base'),
	require('./transforms/base-js'),
	require('./transforms/base-scss'),
	require('./transforms/apply-simple-options'),
	require('./transforms/babel'),
	require('./transforms/head-css'),
	require('./transforms/external-n-ui'),
	require('./transforms/prod'),
	require('./transforms/preact'),
	require('./transforms/wrap'),
	require('./transforms/verify'),
	require('./transforms/stats')
];

function constructVariants (options) {
	return [
		options,
		Object.assign(clone(options), {
			language: 'scss',
			cssVariant: 'ie8',
			entry: filterEntryKeys(options.entry, /\.css$/, '-ie8.css'),
			withHeadCss: false
		}),
		Object.assign(clone(options), {
			language: 'js',
			externals: {'n-ui': true},
			entry: filterEntryKeys(options.entry, /\.js$/, '-without-n-ui.js')
		})
	]
}

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
		return constructVariants(options).map(options => construct(options));
	} else {
		return construct(options);
	}
}
