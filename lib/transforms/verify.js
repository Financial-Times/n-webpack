const VerifyBuild = require('../addons/verify-build');

module.exports = function (options, output) {
	if (process.argv.indexOf('--dev') === -1) {
		output.plugins.push(new VerifyBuild('prod'));
	} else {
		output.plugins.push(new VerifyBuild('dev'));
	}
}
