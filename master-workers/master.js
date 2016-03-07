var fork = require('child_process').fork;
var cpus = require('os').cpus();

var server = require('net').createServer();
server.listen(3000);

var workers = {};

var createWorker = function() {
	var worker = fork(__dirname + '/worker.js');

	worker.on('message', function(message) {
		if(message.act === 'suicide') {
			createWorker();
		}
	});

	worker.on('exit', function(code) {
		console.log('worker ' + worker.pid + ' exited.' + code);
		delete workers[worker.pid];
	});

	worker.send('server', server);
	worker[worker.pid] = worker;
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