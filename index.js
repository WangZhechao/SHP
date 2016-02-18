var express = require('express'),
	shp = require('./lib'),
	errors = require('./lib/errors'),
	parentApp = express();


//启动服务
shp().then(function(shpServer) {
	parentApp.use('/', shpServer.rootApp);
	shpServer.start(parentApp);
}).catch(function(err) {
	errors.logErrorAndExit(err, err.context, err.help);
});