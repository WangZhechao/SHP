var fork = require('child_process').fork,
	path = require('path'),
	config = require('../../config.js'),
	updateProcess;

//检测
if(config.updateCheck === true) {
	setInterval(function() {
		updateProcess = fork(path.join(__dirname, './update-check.js'));
	}, config.update.checkTime);	
}