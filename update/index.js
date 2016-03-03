var http = require('http'),
	fs = require('fs');


module.exports = function download(options, path) {
	options = {
		host: '127.0.0.1',
		port: 8081,
		path: '/plus_plantform.rar',
		method: 'GET'
	};

	var ws = fs.createWriteStream(path),
		clientReq = http.request(options, function(res) {
			console.log('download: ', res.statusCode);
			
			res.on('data', function(chunk) {
				ws.write(chunk);
			});

			res.on('end', function() {
			  console.log('No more data in response.');
			  ws.end();
			});
		});

	ws.on('drain', function() {
		console.log('drain');
	});

	ws.on('error', function(e) {
		console.log(e.message);
	});

	clientReq.on('error', function(e)  {
	  console.log('problem with request: ', e.message);
	});

	clientReq.end();
};

module.exports(null, './plus_plantform.rar');