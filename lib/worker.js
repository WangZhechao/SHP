var express = require('express'),
	shp = require('./core'),
	errors = require('./errors'),
	parentApp = express();


process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//启动服务
shp().then(function(shpServer) {
	parentApp.use('/', shpServer.rootApp);
	shpServer.start(parentApp);
}).catch(function(err) {
	errors.logErrorAndExit(err, err.context, err.help);
});