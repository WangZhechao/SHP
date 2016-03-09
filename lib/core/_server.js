var Promise = require('bluebird'),
	chalk = require('chalk'),
	path = require('path'),
	http = require('http'),
	config = require(path.resolve(__dirname, '../config')),
	errors = require(path.resolve(__dirname, '../errors'));

function SHPServer(rootApp) {
	this.rootApp = rootApp;
	this.httpServer = null;
	this.tcpNet = null;
	this.connections = {};
	this.connectionId = 0;
}


SHPServer.prototype.start = function(externalApp) {
	var self = this,
		rootApp = externalApp ? externalApp : self.rootApp;



	return new Promise(function(resolve) {

		self.httpServer = http.createServer(rootApp);

		self.httpServer.on('error', function(error) {
			if(error.errno === 'EADDRINUSE') {
				errors.logError('(EADDRINUSE) 程序启动失败！',
					'端口：' + config.server.port + '被另一个程序占用。',
					'您是否已经开启了该服务？请检查端口使用情况。');
			} else {
				error.logError('(Code: ' + error.errno + ')',
					'程序启动失败！',
					'请百度该错误代码寻找解决方案。');
			}

			process.exit(-1);
		});

		self.httpServer.on('connection', self.connection.bind(self));


		//监听进程消息
		process.on('message', function(msg, tcp) {
			if(msg === 'server') {
				self.tcpNet = tcp;

				tcp.on('connection', function(socket) {
					self.httpServer.emit('connection', socket);
				});

				resolve(self);
			}
		});


		//监听异常
		process.on('uncaughtException', function(err) {

			process.send({act: 'suicide'});

			self.tcpNet.close(function() {
				process.exit(1);
			});

			setTimeout(function() {
				process.exit(1);
			}, 10000);
		});


		if(process.send) {
			process.send({act: 'listen', pid: process.pid});
		}
	});
};


SHPServer.prototype.stop = function() {
	var self = this;

	return new Promise(function(resolve) {
		if(self.httpServer === null) {
			resolve(self);
		} else {
			self.httpServer.close(function() {
				self.httpServer = null;
				self.logShutdownMessages();
				resolve(self);
			});

			self.closeConections();
		}
	});
};


SHPServer.prototype.restart = function() {
	return this.stop().then(this.start.bind(this));
};


SHPServer.prototype.connection = function(socket) {
	var self = this;

	self.connectionId += 1;
	socket._tsId = self.connectionId;

	socket.on('close', function() {
		delete self.connections[this._tsId];
	});

	self.connections[socket._tsId] = socket;
};


SHPServer.prototype.closeConections = function() {
	var self = this;

	Object.keys(self.connections).forEach(function(socketId) {
		var socket = self.connections[socketId];

		if(socket) {
			socket.destroy();
		}
	});
};


SHPServer.prototype.logShutdownMessages = function() {
	console.log(chalk.red('\n服务后台关闭...'));
};


module.exports = SHPServer;