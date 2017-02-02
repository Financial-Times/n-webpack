const assert = require('assert');
const nUiWebpack = require('../index');

describe('Webpack config', () => {
  it('should do the thing', () => {
		let config = nUiWebpack({
			entry:  {
				'./public/main.js': './client/main.js',
				'./public/main.css': './client/main.scss'
			}
		})
		assert.equal(-1, config);
	});
});
