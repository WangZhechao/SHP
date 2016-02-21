var Promise = require('bluebird'),
    errors = require('../../lib/errors');


var HomeModel = Class.define('HomeModel', {
	extend: 'BaseModel',

	browse: function() {

		//this.db

		return Promise.resolve({
			view: 'home.ejs',
			locals: {title: 'SHP测试主页！'}
		});
	}
});

module.exports = new HomeModel();