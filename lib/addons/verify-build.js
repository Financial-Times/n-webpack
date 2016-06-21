'use strict';
const fs = require('fs');
const join = require('path').join;
const gitignore = fs.readFileSync(join(process.cwd(), '.gitignore'), 'utf8')
	.split('\n');


function noWildcard () {
	gitignore.forEach(pattern => {
		if (/^\/public\/(.*\/\*|\*|$)/.test(pattern)) {
			throw new Error('Wildcard pattern for built public assets not allowed in your .gitignore. Please specify a path for each file');
		}
	});
}

function cleanPath (path) {
	return path.replace(/^\.?\/?public\/?/, '')
}

function compareArrays (a1, a2) {
	a2.forEach(s => {
		if (a1.indexOf(s) === -1) {
			throw s;
		}
	});
}

function VerifyBuild () {
	return function () {
		this.plugin('done', stats => {

			const rx = /^\.?\/?public.*(css|js)$/;
			const builtFiles = Object.keys(stats.compilation.assets)
				.filter(file => rx.test(file))
				.map(cleanPath);
			const expectedFiles = gitignore
				.filter(pattern => rx.test(pattern))
				.map(cleanPath);

			try {
				compareArrays(builtFiles, expectedFiles)
			} catch(e) {
				throw `${e} is in your .gitignore but has not been built - is the build broken, or do you need to remove a line from .gitignore?`;
			}

			try {
				compareArrays(expectedFiles, builtFiles)
			} catch(e) {
				throw `${e} has been built but is not in your .gitignore - is the build broken, or do you need to add a new line to .gitignore?`;
			}
		});
	};
};

module.exports = VerifyBuild;

module.exports.noWildcard = noWildcard;