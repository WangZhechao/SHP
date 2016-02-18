var Promise = require('bluebird'),
	express = require('express'),
	logger = require('morgan'),
	compress = require('compression'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	config = require('../config'),
	utils = require('../utils'),
	system = require('./system.js'),
	SHPServer = require('./server.js');


function init(options) {

	var adminApp = express();

	return config.load(options.config).then(function(config) {

		//初始化系统核心
		return system.init(config);

	}).then(function() {

		//是否开启压缩
		if(config.server.compress !== false) {
		    adminApp.use(compress());
		}

		//设置模板引擎
		adminApp.set('views', config.paths.views);
		adminApp.set('view engine', 'ejs');


		//是否开启代理
		if(config.server.proxy === true) {
			adminApp.enable('trust proxy');
		} else {
			adminApp.disable('trust proxy');
		}

		//日志信息
		//https://github.com/expressjs/morgan
		var logging = config.logging;
		if (logging !== false) {
		    if (adminApp.get('env') !== 'development') {
		        adminApp.use(logger('combined', logging));
		    } else {
		        adminApp.use(logger('dev', logging));
		    }
		}


		adminApp.use(bodyParser.json({limit: '1mb'}));
		adminApp.use(bodyParser.urlencoded({extended: true, limit: '1mb'}));
		adminApp.use(cookieParser());

		//设置静态文件路径
		adminApp.use(express.static(config.paths.clientAssets, {maxAge: utils.ONE_YEAR_MS}));

		return new SHPServer(adminApp);
	});
}


module.exports = init;