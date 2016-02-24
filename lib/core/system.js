var Promise = require('bluebird'),
	_ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	express = require('express'),
	api = require('../api'),
	errors = require('../errors'),
	config = require('../config');


function safeRequire(file){
  'use strict';
  try{
    return require(file);
  }catch(err){
  	errors.logErrorAndExit(err, err.context, '请检测文件：' + file);
  }
}


//加载基础模块
function loadBaseModule() {
	var paths = ['../base/ClassManager.js', '../base/ClassBase.js', './model.js', './controller.js'];
	var aliases = ['ClassManager', 'Class', 'BaseModel', 'BaseController'];

	for(var i=0,ln=paths.length; i<ln; i++) {
		if(paths[i] && aliases[i]) {
			global[aliases[i]] = safeRequire(paths[i]);
		}
	}

	global.M = {}; //模型
	global.C = {}; //控制器
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
		if(path.extname(fileName) !== '.js') {
			return true;
		}

		var filePath = path.join(dirPath, '/' + fileName);
		var fileStat = fs.statSync(filePath);

		if(fileStat.isFile()) {
			global.M[path.basename(fileName, '.js')] = safeRequire(filePath);
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
		if(path.extname(fileName) !== '.js') {
			return true;
		}
		
		var filePath = path.join(dirPath, '/' + fileName);
		var fileStat = fs.statSync(filePath);

		if(fileStat.isFile()) {
			global.C[path.basename(fileName, '.js')] = safeRequire(filePath);
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
				method = arr[0];
				uri = arr[1];
			} else {
				uri = arr[0];
				method = 'use';
			}

			if(!router[method]) {
				return true;
			}

			//如果是对象
			controller = routeConfig[action];

			if(_.isArray(controller) && controller.length > 0) {
				last = controller.pop();
				if(_.isObject(last) && last.view) {
					last = api.html(last.view);
				} else if(_.isObject(last) && last.json) {
					last = api.json(last.json);
				} else if(_.isFunction(last)) {
					last = api.json(last);
				}

				controller.push(last);
				router[method](uri, controller);
			} else if(_.isFunction(controller)) {
				router[method](uri, api.json(controller));
			} else if(_.isObject(controller)) {
				if(controller.view) {
					router[method](uri, api.html(controller.view));
				} else if(controller.json) {
					router[method](uri, api.json(controller.json));
				}
			}
		});

		//rootApp.use(config.apiUri, router);
		rootApp.use(router);
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