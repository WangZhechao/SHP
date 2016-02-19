var Promise = require('bluebird'),
	_ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	express = require('express'),
	api = require('../api'),
	errors = require('../errors'),
	config = require('../config');

//加载基础模块
function loadBaseModule() {
	var paths = ['../base/ClassBase.js', '../base/ClassManager.js', './model.js', './controller.js'];
	var aliases = ['Class', 'ClassManager', 'BaseModel', 'BaseController'];

	for(var i=0,ln=paths.length; i<ln; i++) {
		if(paths[i] && aliases[i]) {
			global[aliases[i]] = require(paths[i]);
		}
	}

	global.M = {}; //模型
	global.C = {}; //控制器
}


function safeRequire(file){
  'use strict';
  try{
    return require(file);
  }catch(err){
  	errors.logErrorAndExit(err, err.context, '请检测文件：' + file);
  }
}

//加载模型
function loadModels() {
	var dirPath = config.paths.models;

	var files = fs.readdirSync(dirPath);
	if(!files) {
		var err = new Error('加载模型文件错误！');
		return errors.logErrorAndExit(err, err.context, 'models文件夹是否存在！');
	}

	files.forEach(function(fileName) {
		var filePath = path.join(dirPath, '/' + fileName);
		var fileStat = fs.stat(filePath);

		if(fileStat.isFile()) {
			global.M[fileName] = safeRequire(filePath);
		}
	});
}


//加载控制器
function loadControllers() {
	var dirPath = config.paths.controllers;

	var files = fs.readdirSync(dirPath);
	if(!files) {
		var err = new Error('加载控制器文件错误！');
		return errors.logErrorAndExit(err, err.context, 'controllers文件夹是否存在！');
	}

	files.forEach(function(fileName) {
		var filePath = path.join(dirPath, '/' + fileName);
		var fileStat = fs.stat(filePath);

		if(fileStat.isFile()) {
			global.C[fileName] = safeRequire(filePath);
		}
	});
}


//加载路由器
function loadRoutes() {
	var dirPath = config.paths.routes;
	var routeConfig = safeRequire(dirPath);
	var actions = _.keys(routeConfig);

	//解析
	var analyze = function(rootApp) {
		var router = express.Router();
		var method, uri, controller, last;

		_.forEach(actions, function(action) {
			var arr = action.split(' ');
			if(arr.length > 1) {
				method = arr.length[0];
				uri = arr.length[1];
			} else {
				uri = arr.length[0];
				method = 'use';
			}

			if(!router[method]) {
				return true;
			}

			//如果是对象
			controller = routeConfig[action];
			if(_.isObject(controller) && controller.view) {
				router[method](uri, api.html(controller));
			} else if(_.isArray(controller) && controller.length > 0) {
				last = controller.pop();
				if(_.isObject(last) && controller.view) {
					last = api.html(last);
				} else if(_.isFuncation(last)) {
					last = api.json(last);
				}

				controller.push(last);
				router[method](uri, controller);
			} else if(_.isFuncation(controller)) {
				router[method](uri, api.json(controller));
			}
		});

		rootApp.use(config.apiUri, router);
	};

	return analyze;
}


//初始化
function init(config) {

	//加载基础模块
	loadBaseModule();

	//加载模型
	loadModels();

	//加载控制器
	loadControllers();

	//加载路由
	return Promise.resolve(loadRoutes());
}

module.exports.init = init;