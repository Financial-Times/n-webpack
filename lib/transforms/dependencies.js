function checkDependency (name, errors) {
	try {
		require.resolve(name);
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') errors.push(name);
	}
}

module.exports = function (options) {
	const errors = [];
	checkDependency('babel-plugin-add-module-exports', errors);
	checkDependency('babel-plugin-transform-runtime', errors);
	if (options.handleReact) {
		checkDependency('babel-preset-react', errors);
	}
	if (options.ECMAScriptVersion <= 5) {
		checkDependency('babel-preset-es2015', errors);
		checkDependency('babel-plugin-transform-es2015-classes', errors);
	}
	if (errors.length) {
		console.error(`There are missing dependencies. \r\nTo install them, run: \`npm install -S ${errors.join(' ')}\``); //eslint-disable-line no-console
		process.exit(2);
	}
}
