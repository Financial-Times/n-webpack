const expect = require('chai').expect;
const nUiWebpack = require('../index');

describe('nUiWebpack', () => {
	let output = nUiWebpack({
		entry: 'main.js',
		withHeadCss: true,
		handleReact: true,
		usePreact: true,
		outputStats: 'myStatsFile.json'
	});
	it('should generate a webpack configuration object with appropriate values', () => {
		expect(output.entry).to.be.a('string', 'output.entry');
		expect(output.devtool).to.be.a('string', 'output.devtool');
		expect(output.plugins).to.be.an('array', 'output.plugins');
		expect(output.sassLoader).to.be.an('object', 'output.sassLoader');
		expect(output.postcss).to.be.a('function', 'output.postcss');
		expect(output.output.filename).to.be.a('string', 'output.output.filename');
		expect(output.module.rules).to.be.an('array', 'output.module.rules');
		expect(output.resolve.modules).to.be.an('array', 'output.resolve.modules');
		expect(output.resolve.alias).to.be.an('object', 'output.resolve.alias');
		expect(output.resolveLoader.alias).to.be.an('object', 'output.resolveLoader.alias');
		expect(output.resolveLoader.alias.raw).to.be.a('string', 'output.resolveLoader.alias.raw');
		expect(output.resolveLoader.alias.imports).to.be.a('string', 'output.resolveLoader.alias.imports');
		expect(output.resolveLoader.alias.postcss).to.be.a('string', 'output.resolveLoader.alias.postcss');
		expect(output.resolveLoader.alias.sass).to.be.a('string', 'output.resolveLoader.alias.sass');
	});
});
