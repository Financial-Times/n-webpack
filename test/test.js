const expect = require('chai').expect;
const nUiWebpack = require('../index');

describe('nUiWebpack', () => {
	let config = nUiWebpack({
		entry: 'main.js',
		withHeadCss: true
	});
	it('should return correct values', () => {
		expect(config.entry).to.be.a('string');
		expect(config.devtool).to.be.a('string');
		expect(config.plugins).to.be.an('array');
		expect(config.sassLoader).to.be.an('object');
		expect(config.postcss).to.be.a('function');
		expect(config.output.filename).to.be.a('string');
		expect(config.module.loaders).to.be.an('array');
		expect(config.resolve.root).to.be.an('array');
		expect(config.resolveLoader.alias).to.be.an('object');
		expect(config.resolveLoader.alias.raw).to.be.a('string');
		expect(config.resolveLoader.alias.imports).to.be.a('string');
		expect(config.resolveLoader.alias.postcss).to.be.a('string');
		expect(config.resolveLoader.alias.sass).to.be.a('string');
	});
});
