var request = require('request'),
	fs = require('fs'),
	sparkMD5 = require('./spark-md5.js'),
	AdmZip = require('adm-zip');


function download(url, cb) {
	var fileName = url.slice(url.lastIndexOf('/') + 1),
		fileStream = fs.createWriteStream(fileName);

	request
		.get(url, function(err) {
			return cb && cb(err);
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


// download('http://127.0.0.1:8081/plus_plantform.rar', function(err) {
// 	console.log('=', err);
// });
//extract('./thinkjs-master', './test', true);
