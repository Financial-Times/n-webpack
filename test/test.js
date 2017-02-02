const assert = require('assert');
const nUiWebpack = require('../index');

describe('nUiWebpack', () => {
	describe('apply-simple-options', () => {
		let config = nUiWebpack({
			entry: 'a.js',
			loaders: ['a','b','c','d']
		});
		it('should return the correct value for `entry` ', () => {
			assert.strictEqual(config.entry,'a.js');
		});
		it('should return the correct value for `module.loaders` ', () => {
			assert.strictEqual(config.module.loaders,new Array('a','b','c','d'));
		});

		console.log(JSON.stringify(config.module.loaders))

	});
});
