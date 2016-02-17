var Promise = require('bluebird'),
	express = require('express');


function init(options) {

	var adminApp = express();

	return config.load(options.config).then(function() {

	});
}


module.exports = init;