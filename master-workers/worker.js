// var http = require('http');
// http.createServer(function(req, res) {
// 	res.writeHead(200, {'Content-Type': 'text/plain'});
// 	res.end('Hello World~!');
// }).listen(Math.round((1+Math.random()) * 1000), '127.0.0.1');

// console.log('走起：'  + process.pid);

// process.on('message', function(m) {
// 	console.log('子：', m);
// });

// process.send('子发送。。。');

// process.on('message', function(m, server) {
// 	if(m === 'server') {
// 		server.on('connection', function(socket) {
// 			console.log('----');
// 			socket.end('handled by child\n');
// 		});
// 	}
// });


var http = require('http');
var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('handled by child, pid is' + process.pid + '\n');


});


var worker;
process.on('message', function(m, tcp) {
	if(m === 'server') {
		worker = tcp;
		tcp.on('connection', function(socket) {
			server.emit('connection', socket);
		});
	}
});

process.on('uncaughtException', function(err) {

	console.log(err, process.pid);

	process.send({act: 'suicide'});

	worker.close(function() {
		process.exit(1);
	});

	setTimeout(function() {
		process.exit(1);
	}, 10000);
});