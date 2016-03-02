var Promise = require('bluebird'),
	fs = Promise.promisifyAll(require("fs")),
	path = require('path'),
	chalk = require('chalk'),
	spawn = require("child_process").spawn,
	isWindow = (process.platform === 'win32'),
	config = require(path.resolve(__dirname, '../lib/config')),
	errors = require(path.resolve(__dirname, '../lib/errors')),
	restarting = false,
	childProcess,
	exec = 'node',
	prog = [path.join(config.paths.shpPath, 'index.js')];
	

function startProgram() {
	restarting = false;

	childProcess = spawn(exec, prog, {stdio: 'inherit'});
	childProcess.addListener('exit', function(code) {
		//子进程启动失败，设置为null，下次crash自动重启。
		if(!restarting) {
			childProcess = null;
			return;
		}

		startProgram();
	});

	console.log('主进程：' + process.pid, '子进程：' + childProcess.pid);
}


function crash() {
	if(restarting) {
		return;
	}

	restarting = true;
	setTimeout(function() {
		if(childProcess) {
			process.kill(childProcess.pid);
		} else {
			startProgram();
		}
	}, 50);
}


function crashWin(event, fileName) {
	if(event === 'change') {
		crash();
	}
}

function crashOther(oldStat, newStat) {
	if(oldStat.mtime.getTime() !== newStat.mtime.getTime()) {
		crash();
	}
}

function watchFile(watch, poll_interval) {
	if(isWindow) {
		return fs.watch(watch, { persistent: true, interval: poll_interval }, crashWin);
	} else {
		return fs.watchFile(watch, { persistent: true, interval: poll_interval }, crashOther);
	}
}


function findAllWatchFiles(dir) {
	var watchFiles = [],
		extensions = 'node,js',
		fileExtensionPattern = new RegExp('^.*\.(' + extensions.replace(/,/g, '|') + ')$');

	dir = path.resolve(dir);

	function findFiles(dir) {
		return fs.statAsync(dir).then(function(stats) {
			if(stats.isDirectory()) {
				return fs.readdirAsync(dir).then(function(fileNames) {
					var files = [];
					
					fileNames.forEach(function(fileName) {
						files.push(findFiles(path.join(dir, fileName), watchFiles));
					});

					return Promise.all(files);
				}).catch(function(err) {
					return errors.logAndRejectError(err, '读取文件夹信息失败！', '请检测文件夹是否存在！');
				});
			} else if(stats.isFile() && dir.match(fileExtensionPattern)){
				watchFiles.push(dir);
				return Promise.resolve(dir);
			}
		}).catch(function(err) {
			return errors.logAndRejectError(err, '获取目录信息失败：' + dir, '请查看该目录是否存在！');
		});
	}

	return findFiles(dir).then(function() {
		return watchFiles;
	});
}


function run(args) {
	var pollInterval = 1000,
		path = config.paths.appPath;

	findAllWatchFiles(path).then(function(files) {
		return Promise.each(files, function(item) {
			watchFile(item, pollInterval);
		});
	});	

	try {
	  // Pass kill signals through to child
	  [ "SIGTERM", "SIGINT", "SIGHUP", "SIGQUIT" ].forEach( function(signal) {
	    process.on(signal, function () {
	      if (childProcess) {
	        childProcess.kill(signal);
	      }

	      process.exit();
	    });
	  });
	} catch(e) {
	  // Windows doesn't support signals yet, so they simply don't get this handling.
	  // https://github.com/joyent/node/issues/1553
	}

	startProgram();
}

run();