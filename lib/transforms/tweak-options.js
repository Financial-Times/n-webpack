const path = require('path');
const packageJson = require(path.join(process.cwd(),'package.json'));
function hasReact () {
	return !!(packageJson.dependencies && (packageJson.dependencies.react || packageJson.dependencies['preact-compat']));
}

function hasPreact () {
	return !!(packageJson.dependencies && packageJson.dependencies['preact-compat']);
}

module.exports = function (options) {
	// backwards compatible with our pluralised properties
	// but prefers webpack's non-plural property names
	options.handleReact = ('withReact' in options) ? options.withReact : hasReact();
	options.usePreact = hasPreact();
	options.ECMAScriptVersion = ('ECMAScriptVersion' in options) ? options.ECMAScriptVersion : 5;
}
