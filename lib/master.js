var fork = require('child_process').fork,
	cpus = require('os').cpus(),
	util = require('util'),
	net = require('net');


var server = net.createServer();
server.listen(3000);

var workers = {};

var createWorker = function(index) {
	var worker, workerEnv;

	workerEnv = util._extend({}, process.env);
	workerEnv.SHP_UNIQUE_ID = '' + index;

	worker = fork(__dirname + '/worker.js', [], {
		env: workerEnv
	});

	worker.on('message', function(message) {
		if(message.act === 'suicide') {
			createWorker();
		} else if(message.act === 'listen') {
			if(workers[message.pid]) {
				workers[message.pid].send('server', server);
			}
		}
	});

	worker.on('exit', function(code) {
		console.log('worker ' + worker.pid + ' exited.' + code);
		delete workers[worker.pid];
	});

	workers[worker.pid] = worker;
	console.log('worker pid ' + worker.pid);
};

for(var i=0; i<cpus.length; i++) {
	createWorker(i);
}

process.on('exit', function() {
	for(var pid in workers) {
		workers[pid].kill();
	}
});