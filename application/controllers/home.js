var Promise = require('bluebird'),
    errors = require('../../lib/errors');


var HomeController = Class.define('HomeController', {
	extend: 'BaseController',

	browse: function() {

		return M.home.browse();

		// return Promise.resolve({
		// 	view: 'home.ejs',
		// 	locals: {title: 'SHP测试主页！'}
		// });
	}
});

module.exports = new HomeController();