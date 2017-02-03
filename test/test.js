const expect = require('chai').expect;
const nUiWebpack = require('../index');

describe('nUiWebpack', () => {
	
	describe('base', () => {
		let config = nUiWebpack({});
		it('should return correct values', () => {
			expect(config.devtool).to.equal('source-map');
			expect(config.resolve.root).to.be.an('array');
			expect(config.module.loaders).to.be.an('array');
			expect(config.plugins).to.be.an('array');
			expect(config.resolveLoader.alias).to.be.an('object');
		});
	});
	
	describe('apply-simple-options', () => {
		const loaders = ['a','b','c','d'];
		let config = nUiWebpack({
			entry: 'a.js',
			loaders: loaders
		});
		it('should return correct values', () => {
			expect(config.output.filename).to.equal('[name]');
			expect(config.entry).to.equal('a.js');
			expect(config.module.loaders).to.deep.equal(loaders);
		});
	});
});


