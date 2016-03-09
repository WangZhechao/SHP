var fork = require('child_process').fork,
	cpus = require('os').cpus(),
	net = require('net');


var server = net.createServer();
server.listen(3000);

var workers = {};

var createWorker = function() {
	var worker = fork(__dirname + '/index.js');

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
	createWorker();
}

process.on('exit', function() {
	for(var pid in workers) {
		workers[pid].kill();
	}
});