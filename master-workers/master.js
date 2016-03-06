// var fork = require('child_process').fork;
// var cpus = require('os').cpus();

// for (var i=0; i<cpus.length; i++) {
// 	var worker = fork('./worker.js');

// 	worker.on('message', function(m) {
// 		console.log('主：', m);
// 	});

// 	worker.send('主发送。。。');
// }


// var worker = require('child_process').fork('worker.js');
// var server = require('net').createServer();
// server.on('connection', function(socket) {
// 	console.log('====');
// 	socket.end('handled by parent\n');
// });

// server.listen(1337, function() {
// 	worker.send('server', server);
// });

var cp = require('child_process');
var worker1 = cp.fork('worker.js');
var worker2 = cp.fork('worker.js');

var server = require('net').createServer();
server.listen(1337, function() {
	worker1.send('server', server);
	worker2.send('server', server);

	server.close();
});