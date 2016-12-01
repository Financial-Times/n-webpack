
function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
}

function modifyEntryKeys (obj, rx, nameModifier) {
	const keys = Object.keys(obj).filter(key => rx.test(key))
	return keys.reduce((o, key) => {
		o[nameModifier(key)] = obj[key]
		return o;
	}, {})
}

function filterEntryKeys (obj, rx, negativeMatch) {
	const keys = Object.keys(obj).filter(key => negativeMatch ? !rx.test(key) : rx.test(key))
	return keys.reduce((o, key) => {
		o[key] = obj[key]
		return o;
	}, {})
}

module.exports = function constructVariants (nWebpackOptions, variantOptions) {
	const exclude = variantOptions.exclude || [];
	// we no longer build a main.js for the app when generating the standard asset variants
	const variants = [
		Object.assign({}, nWebpackOptions, {
			entry: filterEntryKeys(nWebpackOptions.entry, /main\.js$/, true)
		})
	]

	if (exclude.indexOf('ie8-styles') === -1) {
		variants.push(Object.assign(clone(nWebpackOptions), {
			language: 'scss',
			cssVariant: 'ie8',
			entry: modifyEntryKeys(nWebpackOptions.entry, /main.*\.css$/, name => name.replace(/\.css$/, '-ie8.css')),
			withHeadCss: false
		}))
	}
	if (exclude.indexOf('external-n-ui') === -1) {
		variants.push(Object.assign(clone(nWebpackOptions), {
			language: 'js',
			externals: {'n-ui': true},
			entry: modifyEntryKeys(nWebpackOptions.entry, /main\.js$/, name => name.replace(/\.js$/,'-without-n-ui.js'))
		}))
	}

	return variants
}
