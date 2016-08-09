const EntryWrap = require('../addons/entry-wrap');

module.exports = function (options, output) {
		if (options.cssVariant === 'ie8') {
			output.plugins.push(
				new EntryWrap(
					`$o-grid-ie8-rules: 'only';
$o-grid-fixed-layout: 'L';
$o-grid-mode: 'fixed';
$output-critical: false;
`, '', { match: /\.scss$/ })
			);
		}
}
