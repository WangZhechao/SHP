var Promise = require('bluebird'),
	request = require('request'),
	fs = require('fs'),
	semver = require('semver'),
	sparkMD5 = require('./spark-md5.js'),
	errors   = require('./errors'),
	config   = require('./config'),
	AdmZip = require('adm-zip');


function updateCheckError(error) {

	//记录日志

	errors.logError(
	    error,
	    '检测更新文件失败！',
	    '如果可能请通知管理员！'
	);
}


//获取远程更新信息
function updateCheckResponse() {
	return new Promise(function(resolve, reject) {
		var updateInfo, flag;

		request(config.app.update, function (error, response, body) {

			if(error || response.statusCode !== 200) {
				return reject(error);
			}

			try {
				updateInfo = JSON.parse(body);	
			} catch (e) {
				return reject(e);
			}


			flag = semver.lt(semver.clean(config.app.version), 
				semver.clean(updateInfo.version));


			if(!flag) {
				return reject(new Error('没有新的版本！[' + config.app.version + ' | ' + updateInfo.version + ']'));
			}

			return resolve(updateInfo);
		});
	});
}




function download(url, cb) {
	var fileName = url.slice(url.lastIndexOf('/') + 1),
		fileStream = fs.createWriteStream(fileName);

	request
		.get(url, function(err) {
			return cb && cb(err, fileName);
		})
		.pipe(fileStream);
}


function md5(file) {
	var hexHash,
		data = fs.readFileSync(file, 'binary'),
		spark = new sparkMD5();

	spark.appendBinary(data);
	hexHash = spark.end();

	return hexHash;
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


module.exports = function(opts, cb) {
	var url = opts.url || '',
		checkMD5 = opts.md5 || '',
		targetPath = opts.path || '',
		filePath;

	download(url, function(err, fileName) {
		if(err) {
			return cb && cb(err);
		}

		filePath = './' + fileName;
		if(fileName && checkMD5 === md5(filePath)) {
			res = extract(filePath, targetPath, true);
			if(!res) {
				return cb && cb(new Error('extract file error.'));
			}

			return cb && cb(null);
		} else {
			return cb && cb(new Error('md5 check error.'));
		}
	});
};


// module.exports({
// 	url: 'http://127.0.0.1:8081/thinkjs-master.zip',
// 	md5: '07312fb8769d3d38bdf5d374dcaffc5c',
// 	path: 'E:\\Projects\\SHP\\update'
// }, function(err) {
// 	console.log(err);
// });