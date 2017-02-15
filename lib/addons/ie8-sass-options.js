module.exports = function (source) {
	return `$o-grid-ie8-rules: 'only';
$o-grid-mode: 'fixed';
$o-grid-fixed-layout: 'XL';

$output-critical: false;
${source}
`
};
