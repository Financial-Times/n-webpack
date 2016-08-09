function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
}

function filterOnKeys (obj, rx, suffix) {
	const keys = Object.keys(obj).filter(key => rx.test(key))
	return keys.reduce((o, key) => {
		o[key.replace(rx, suffix)] = obj[key]
		return o;
	}, {})
}

module.exports = function (options) {
	return [
		options,
		Object.assign(clone(options), {
			language: 'scss',
			cssVariant: 'ie8',
			entry: filterOnKeys(options.entry, /\.css$/, '-ie8.css'),
			withHeadCss: false
		}),
		Object.assign(clone(options), {
			language: 'js',
			externals: {'n-ui': true},
			entry: filterOnKeys(options.entry, /\.js$/, '-without-n-ui.js')
		})
	]
}
