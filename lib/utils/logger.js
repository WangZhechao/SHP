var _ = require('lodash'),
	moment = require('moment'),
	winston = require('winston'),
	config = {
		levels: {
			info: 0,
			warn: 1,
			error: 2,
			see: 3
		},

		colors: {
			info: 'green',
			warn: 'yellow',
			error: 'red',
			see: 'blue'
		}
	};

var logger = new(winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			colorize: true,
			level: 'info'
	    }),
		new (winston.transports.File)({
			filename: 'logger.log',
			maxsize: 1024*1024*10,
			maxFiles: 3
		})
	],

	levels: config.levels,
	colors: config.colors
});


module.exports = {

	write: function(type, opts, obj) {
		var optsJson, obJson, log,
			use = ['type', 'ak', 'method', 'path', 'ip'];

		try {
			optsJson = JSON.stringify(_.omit(opts, use));
			obJson = JSON.stringify(obj);
		} catch(e) {
			optsJson = '';
			obJson = '';
		}

	 	log = _.merge({
				insertTime: moment().format('YYYY-MM-DD HH:mm:ss'),
				optsJson: optsJson,
				obJson: obJson
			}, _.pick(opts, use));

	 	logger.info(log);

		return Promise.resolve(log);
	}
};