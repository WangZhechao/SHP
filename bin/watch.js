var Promise = require('bluebird'),
	path = require('path'),
	fs = require('fs'),
	config = require(path.resolve(__dirname, '../lib/config')),
	errors = require(path.resolve(__dirname, '../lib/errors')),
	nodeVersion = process.version.split("."),
	isWindowsWithoutWatchFile = process.platform === 'win32' && parseInt(nodeVersion[1]) <= 6;


function crashWin(event, fileName) {

}

function crashOther(oldStat, newStat) {

}

function watchFile(watch, poll_interval) {
	if(isWindowsWithoutWatchFile) {
		return fs.watch(watch, { persistent: true, interval: poll_interval }, crashWin);
	} else {
		return fs.watchFile(watch, { persistent: true, interval: poll_interval }, crashOther);
	}
}

function findAllWatchFiles(dir) {
	var extensions = 'node,js',
		fileExtensionPattern = new RegExp('^.*\.(' + extensions.replace(/,/g, '|') + ')$');

	dir = path.resolve(dir);

	fs.stat(dir, function(err, stats) {
		if(err) {
			return errors.logAndRejectError(err, '获取目录信息失败：' + dir, '请查看该目录是否存在！');
		}
		
		if(stats.isDirectory()) {
			if(isWindowsWithoutWatchFile) {
				return Promise.resolve(dir);
			}

			fs.readdir(dir, function(err, fileNames) {
				if(err) {
					return errors.logAndRejectError(err, '读取文件夹信息失败！', '请检测文件夹是否存在！');
				}

				fileNames.forEach(function(fileName) {
					return findAllWatchFiles(path.join(dir, fileName));
				});
			});
		} else if(stats.isFile() && dir.match(fileExtensionPattern)){
			return Promise.resolve(dir);
		}
	});
}


function run(args) {
	var pollInterval = 1000,
		path = config.paths.appPath;

	findAllWatchFiles(path, function(file) {
		watchFile(file, pollInterval);
	});
}


run();