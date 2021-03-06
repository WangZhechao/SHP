var Promise = require('bluebird'),
	request = require('request'),
	fs = require('fs'),
	path = require('path'),
	semver = require('semver'),
	sparkMD5 = require('./spark-md5.js'),
	pid = require('./pid.js'),
	errors   = require('../errors'),
	config   = require('../config'),
	settting = require('../../config.js'),
	AdmZip = require('adm-zip');


function updateCheckError(error) {
	//记录日志
	errors.logError(
	    error,
	    '检测更新文件失败！',
	    '如果可能请通知管理员！'
	);
}


/**
{
	version: v0.0.1,
	md5: xxxxxxxxxxxxxxxxxxxx,
	download: http://xxxxxxxxxxxx/xxx.zip
}
 */

//获取远程更新信息
function updateCheckVersion() {
	return new Promise(function(resolve, reject) {
		var updateInfo, flag;

		request(settting.update.url, function (error, response, body) {

			if(error || response.statusCode !== 200) {
				return reject(error);
			}

			try {
				updateInfo = JSON.parse(body);	
			} catch (e) {
				return reject(e);
			}


			flag = semver.lt(settting.update.version, updateInfo.version);


			if(!flag) {
				return reject(new Error('没有新的版本！[' + settting.update.version + ' | ' + updateInfo.version + ']'));
			}

			return resolve(updateInfo);
		});
	});
}


function md5(file) {
	var hexHash,
		data = fs.readFileSync(file, 'binary'),
		spark = new sparkMD5();

	spark.appendBinary(data);
	hexHash = spark.end();

	console.log(hexHash);

	return hexHash;
}


//下载文件
function downloadFile(vInfo) {
	var url = vInfo.download || '',
		fileName = path.join(config.paths.shpPath, '../', (vInfo.version || '') + '.zip'),
		fileStream = fs.createWriteStream(fileName);

	return new Promise(function(resolve, reject) {
		request.get(url, function(err) {
			if(err) {
				return reject(err);
			}

			if(vInfo.md5 === md5(fileName)) {
				return resolve({
					fileName: fileName,
					version: vInfo.version
				});
			}

			fs.unlinkSync(fileName);
			return reject(new Error('md5校验错误！[' + fileName + ']'));

		}).pipe(fileStream);
	});
}


function extract(file, targetPath, overWrite) {
	var zip;

	try {
		zip = new AdmZip(file);

		if(zip) {
			zip.extractAllTo(targetPath, overWrite);
		}

		return true;
	} catch (e) {
		return false;
	}
}


function updateSystem(fInfo) {
	var newPath = path.join(config.paths.shpPath, '../', fInfo.version, '/'),
		startFile = path.join(newPath, '../', 'index.js'),
		fileContent = 'require("./' + fInfo.version + '/index.js");',
		bRes = extract(fInfo.fileName, newPath, true);

	if(!bRes) {
		return Promise.reject(new Error('解压文件[' + fInfo.fileName + ']到目录[' + newPath + ']失败！'));
	}

	fs.unlinkSync(fInfo.fileName);

	//创建启动文件
	fs.writeFile(startFile, fileContent, function(err) {
		if(err) {
			return Promise.reject(err);
		}

		return Promise.resolve(startFile);
	});
}


/**
 * 该函数会自动杀死当前主进程，所以调用这个函数的基础是你需要要给自动重启的程序。
 * windows ---- nssm（服务）  liunx ---- pm2 (待验证。。。)
 */
function updateCheck() {
	updateCheckVersion().then(function(versionInfo) {
		return downloadFile(versionInfo);
	}).then(function(fileInfo) {
		return updateSystem(fileInfo);
	}).then(function() {
		return pid.read();
	}).then(function(pid) {
		return process.kill(pid);
	}).catch(updateCheckError);
}


updateCheck();