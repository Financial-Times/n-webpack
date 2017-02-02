const fs = require('fs');
const join = require('path').join;
const gitignore = fs.readFileSync(join(process.cwd(), '.gitignore'), 'utf8')
	.split('\n');


function noWildcard () {
	gitignore.forEach(pattern => {
		if (/^\/?public\/(.*\/\*|\*|$)/.test(pattern)) {
			if (pattern !== '/public/n-ui/') {
				throw new Error('Wildcard pattern or entire directories (i.e. /public/) for built public assets not allowed in your .gitignore. Please specify a path for each file');
			}
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

			if (stats.compilation.errors.length || stats.compilation.warnings.length) {
				return;
			}

			const rx = /^\.?\/?public.*(css|js)$/;
			const builtFiles = Object.keys(stats.compilation.assets)
				.filter(file => rx.test(file) && !/public\/n-ui/.test(file))
				.map(cleanPath);
			const expectedFiles = gitignore
				.filter(pattern => rx.test(pattern) && !/public\/n-ui/.test(pattern))
				.map(cleanPath);

			try {
				compareArrays(builtFiles, expectedFiles)
			} catch (e) {
				// don't throw as when there are multiple webpack builds this will give false positives
				// next-express will catch it in prod before starting the app anyway
				// TODO - consider removing this step entirely
				console.warn(`${e} is in your .gitignore but has not been built - is the build broken, or do you need to remove a line from .gitignore?`); // eslint-disable-line no-console
			}

			try {
				compareArrays(expectedFiles, builtFiles)
			} catch (e) {
				throw `${e} has been built but is not in your .gitignore - is the build broken, or do you need to add a new line to .gitignore?`;
			}
		});
	};
};

module.exports = VerifyBuild;

module.exports.noWildcard = noWildcard;
