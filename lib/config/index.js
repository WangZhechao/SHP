/**
 * application configuration
 **/

var path = require('path'),
	Promise = require('bluebird'),
	fs = require('fs'),
	_ = require('lodash'),
	appRoot = path.resolve(__dirname, '../../'),
	libPath = path.resolve(appRoot, 'lib/'),
	packageInfo = require(appRoot, 'package.json'),
	defaultConfig = {};


//配置管理文件，用来生成程序配置信息，包括配置校验工作(暂时舍弃)等等。
function ConfigManager(config) {

	this._config = {};

	this.apiUri = '/api/v0.1/';

	if (config && _.isObject(config)) {
	    this.set(config);
	}
}


ConfigManager.prototype.set = function(config) {

	//合并现有配置，重复覆盖
	_.merge(this._config, config);

	//获取配置路径信息
	this._config.paths = this._config.paths || {};

	//修正现有配置信息
	_.merge(this._config, {
		shpVersion: packageInfo.version,
		paths: {
			appRoot: appRoot,
			libPath: libPath,
			config: this._config.paths.config || path.join(appRoot, 'config.js'),
			configExample: path.join(appRoot, 'config.example.js'),
			
			clientAssets: path.join(appRoot, 'application/assets'),
			views: path.join(appRoot, 'application/views'),
			controllers: path.join(appRoot, 'application/controllers'),
			models: path.join(appRoot, 'application/models')
		}
	});

	//将配置信息和该对象合并，外部可以直接访问配置信息
	_.extend(this, this._config);
};


ConfigManager.prototype.get = function () {
    return this._config;
};


ConfigManager.prototype.load = function(configFilePath) {
	var self = this;

	self._config.paths.config = process.env.SHP_CONFIG || configFilePath || self._config.paths.config;

	return new Promise(function(resolve, reject) {
		fs.stat(self._config.paths.config, function(err) {
			var exist = (err) ? false : true,
				pendingConfig;

			if(!exist) {
				//创建默认配置信息(暂无)
				pendingConfig = {};
				return reject(new Error('没有配置文件，无法初始化！'));
			}


			Promise.resolve(pendingConfig).then(function() {
				//return self.validate(); 校验(无)

				try {
					var config = require(self._config.paths.config);
					return Promise.resolve(config);
				} catch(e) {
					return Promise.reject(e);
				}
			}).then(function(rawConfig) {
				self.set(rawConfig);
				return resolve(self.get());
			}).catch(reject);
		});
	});
};


module.exports = new ConfigManager(defaultConfig);