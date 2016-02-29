var Promise = require('bluebird'),
	fs = Promise.promisifyAll(require("fs")),
	path = require('path'),
	isWindow = (process.platform === 'win32'),
	config = require(path.resolve(__dirname, '../lib/config')),
	errors = require(path.resolve(__dirname, '../lib/errors'));
	

function crash() {
	console.log('====================');
}


function crashWin(event, fileName) {console.log(fileName);
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

function findAllWatchFiles(dir, watchFiles) {
	var extensions = 'node,js',
		fileExtensionPattern = new RegExp('^.*\.(' + extensions.replace(/,/g, '|') + ')$');

	dir = path.resolve(dir);

	return fs.statAsync(dir).then(function(stats) {
		if(stats.isDirectory()) {
			return fs.readdirAsync(dir).then(function(fileNames) {
				var files = [];
				
				fileNames.forEach(function(fileName) {
					files.push(findAllWatchFiles(path.join(dir, fileName), watchFiles));
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


function run(args) {
	var pollInterval = 1000,
		path = config.paths.appPath,
		watchFiles = [];


	findAllWatchFiles(path, watchFiles).then(function() {
		return Promise.each(watchFiles, function(item) {
			watchFile(item, pollInterval);
		});
	});	

	require('../index.js');
}


run();