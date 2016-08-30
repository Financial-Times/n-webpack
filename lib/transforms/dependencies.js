function checkDependency (name, isProd, errors) {
	try {
		require.resolve(name);
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			errors[isProd ? 'prod' : 'dev'].push(name)
		}
	}
}

function outputDepErrors (errors) {
	if (errors.prod.length) {
		console.error('Missing production dependencies'); //eslint-disable-line
		console.error(`Run \`npm install -S ${errors.prod.join(' ')}\``); //eslint-disable-line
	}
	if (errors.dev.length) {
		console.error('Missing dev dependencies'); //eslint-disable-line
		console.error(`Run \`npm install -D ${errors.dev.join(' ')}\``); //eslint-disable-line
	}

	if (errors.prod.length || errors.dev.length) {
		process.exit(2);
	}
}

module.exports = function (options) {
	const errors = {
		prod: [],
		dev: []
	}
	checkDependency('babel-plugin-add-module-exports', true, errors);
	checkDependency('babel-plugin-transform-runtime', true, errors);
	if (options.handleReact) {
		checkDependency('babel-preset-react', true, errors);
	}
	if (options.ECMAScriptVersion <= 5) {
		checkDependency('babel-preset-es2015', true, errors);
		checkDependency('babel-plugin-transform-es2015-classes', true, errors);
	}
	outputDepErrors(errors);
}
