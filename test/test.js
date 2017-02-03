const expect = require('chai').expect;
const nUiWebpack = require('../index');

describe('nUiWebpack', () => {
	describe('apply-simple-options', () => {
		const loaders = ['a','b','c','d'];
		let config = nUiWebpack({
			entry: 'a.js',
			loaders: loaders
		});
		it('should return the correct value for `output.filename` ', () => {
			expect(config.output.filename).to.equal('[name]');
		});
		it('should return the correct value for `entry` ', () => {
			expect(config.entry).to.equal('a.js');
		});
		it('should return the correct value for `module.loaders` ', () => {
			expect(config.module.loaders).to.deep.equal(loaders);
		});
	});
});


