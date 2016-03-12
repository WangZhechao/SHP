var Promise = require('bluebird'),
	chalk = require('chalk'),
	fork = require('child_process').fork,
	cpus = require('os').cpus(),
	util = require('util'),
	config = require('../config'),
	errors = require('./errors'),
	net = require('net');


function Master() {
	this.netServer = null;
	this.workers = {};

	this.during = 60 * 1000;
	this.limit = 10;
	this.restart = [];
}

Master.prototype.isTooFrequently = function() {

	var time, length;

	time = Date.now();
	length = this.restart.push(time);
	if(length > this.limit) {
		this.restart = this.restart.slice(this.limit * -1);
	}

	return this.restart.length >= this.limit && 
		this.restart[this.restart.length - 1] - this.restart[0] < this.during;
};


Master.prototype.createWorker = function(index) {
	var worker, workerEnv, 
		self = this;

	if(self.isTooFrequently()) {
		console.log(chalk.red('\n启动过于频繁，请检测子程序代码是否存在异常！'));
		return;
	}

	workerEnv = util._extend({}, process.env);
	workerEnv.SHP_UNIQUE_ID = '' + index;

	worker = fork(__dirname + '/worker.js', [], {
		env: workerEnv
	});

	worker.on('message', function(message) {
		if(message.act === 'suicide') {
			self.createWorker(message.index);
		} else if(message.act === 'listen') {
			if(self.workers[message.pid]) {
				self.workers[message.pid].send('server', self.netServer);
			}
		}
	});

	worker.on('exit', function(code) {
		console.log(chalk.red('\n子进程' + worker.pid + '已经退出！[code=]' + code));
		delete self.workers[worker.pid];
	});


	self.workers[worker.pid] = worker;
	console.log(chalk.green('\n子进程' + worker.pid + '已开启...'));
};


Master.prototype.start = function() {
	var self = this;

	return new Promise(function(resolve) {
		var i, pid;

		self.netServer = net.createServer();
		self.netServer.on('error', function(error) {
			if(error.errno === 'EADDRINUSE') {
				errors.logError('(EADDRINUSE) 程序启动失败！',
					'端口：' + config.server.port + '被另一个程序占用。',
					'您是否已经开启了该服务？请检查端口使用情况。');
			} else {
				errors.logError('(Code: ' + error.errno + ')',
					'程序启动失败！',
					'请百度该错误代码寻找解决方案。');
			}

			process.exit(-1);
		});

		self.netServer.listen(
			config.server.port, 
			config.server.host
		);

		process.on('exit', function() {
			for(pid in self.workers) {
				self.workers[pid].kill();
			}
		});

		self.netServer.on('listening', function() {
			self.logStartMessages();

			for(i=0; i<cpus.length; i++) {
				self.createWorker(i);
			}

			resolve(self);
		});
	});
};


Master.prototype.logStartMessages = function() {

	if(process.env.NODE_ENV === 'production') {
		console.log(chalk.green('\n主进程' + process.pid + '已开启...'), chalk.gray('Ctrl + C 终止！'));
	} else {
		console.log(chalk.green('\n主进程' + process.pid + '已开启...\n\n' + config.server.host + ':' + config.server.port), chalk.gray(' Ctrl + C 终止！' ));
	}

	function shutdown() {
		console.log(chalk.red('\n主进程' + process.pid + '已经关闭！'));

		if(process.env.NODE_ENV !== 'production') {
			console.log(chalk.yellow('\n主进程运行：' + Math.round(process.uptime()) + 's'));
		}

		process.exit(0);
	}

	process
		.removeAllListeners('SIGINT').on('SIGINT', shutdown)
		.removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};



//走起
//process.env.NODE_CLUSTER_SCHED_POLICY = 'rr';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var master = new Master();
if(master) {
	master.start();
}