var Promise = require('bluebird'),
    errors = require('../../lib/errors');


var Home = Class.define('Home', {
	extend: 'BaseController',

	browse: function() {
		return Promise.resolve({
			view: 'home.ejs',
			locals: {title: 'SHP测试主页！'}
		});
	}
});

module.exports = new Home();