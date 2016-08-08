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
			cssVariant: 'ie8',
			entry: filterOnKeys(options.entry, /\.css$/, '-ie8.css')
		}),
		Object.assign(clone(options), {
			cssVariant: 'without-n-ui',
			entry: filterOnKeys(options.entry, /\.css$/, '-without-n-ui.css')
		}),
		Object.assign(clone(options), {
			externals: {'n-ui': true},
			entry: filterOnKeys(options.entry, /\.js$/, '-without-n-ui.js')
		})
	]
}
