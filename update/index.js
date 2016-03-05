var request = require('request'),
	fs = require('fs'),
	sparkMD5 = require('./spark-md5.js'),
	AdmZip = require('adm-zip');


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