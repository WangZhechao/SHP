var _ = require('lodash');

if(_.find(process.argv.splice(2)) === '-m') {
	require('./lib/master.js');
} else {
	require('./lib/worker.js');
}