var Promise = require('bluebird'),
	config = require('../config'),
	path = require('path'),
	fs = require('fs');


var defaultPidPath = path.join(config.paths.libPath, '/update/pid');

function canWrite(path) {
	return new Promise(function(resolve, reject) {
		fs.open(path, 'w', function(err, fd) {
			if(err) {
				return reject(err);
			}

			fs.close(fd, function(err) {
				if(err) {
					return reject(err);
				}

				resolve(path);
			});
		});
	});
}


function writePid(path) {
	var pid = process.pid;

	path = path || defaultPidPath;

	return canWrite(path).then(function() {
		fs.writeFileSync(path, pid + '\n');
	});
}


function deletePid(path) {
	path = path || defaultPidPath;

	var access;

	try {
		access = fs.accessSync(path, fs.F_OK);
		fs.unlinkSync(path);
	} catch(e) {
		console.log('delete pid file error !');
	}
}


function readPid(path) {
	path = path || defaultPidPath;

	return new Promise(function(resolve, reject) {
		fs.readFile(path, function(err, data) {
			if(err) {
				return reject(err);
			}

			return resolve(data);
		});
	});
}



module.exports = {
	save: writePid,
	delete: deletePid,
	read: readPid
};


