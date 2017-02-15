const fs = require('fs');
const join = require('path').join;
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

	if (exclude.indexOf('external-n-ui') === -1) {
		variants.push(Object.assign(clone(nWebpackOptions), {
			language: 'js',
			externals: {'n-ui': true},
			entry: modifyEntryKeys(nWebpackOptions.entry, /main\.js$/, name => name.replace(/\.js$/,'-without-n-ui.js'))
		}))

		if (process.env.NEXT_APP_SHELL === 'local') {
			const nWebpackWarning = `
/*********** n-webpack warning ************/

You have set the environment variable NEXT_APP_SHELL=local
This should only be used if you are actively developing
n-ui/n-html-app within the context of an app (by bower linking
or similar). It will slow down your build A LOT!!!!

If you do not need this behaviour run

			unset NEXT_APP_SHELL

/*********** n-webpack warning ************/
`;
			console.warn(nWebpackWarning); // eslint-disable-line no-console

			const ignoresNUi = fs.readFileSync(join(process.cwd(), '.gitignore'), 'utf8')
				.split('\n')
				.some(line => line === '/public/n-ui/');

			if(!ignoresNUi) {
				throw 'Add /public/n-ui/ to your .gitignore to start building a local app shell';
			}

			const appShellBuild = Object.assign(clone(nWebpackOptions), {
				language: 'js',
				env: 'dev',
				withBabelPolyfills: false,
				output: {
					filename: '[name]',
					library: 'ftNextUi',
					devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
				},
				entry: {},
				exclude: [/node_modules/]
			});
			appShellBuild.entry['./public/n-ui/es5.js'] = './bower_components/n-ui/_deploy/wrapper.js'
			variants.push(appShellBuild);
		}
	}

	return variants
}
