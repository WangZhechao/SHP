var _ = require('lodash'),
	Promise = require('bluebird'),
	mysql = require('mysql'),
	config = require('../config'),
	errors = require('../errors');


function queryFormat(query, values) {
	if(!values) {
		return query;
	}

	var replaceId = query.replace(/\::(\w+)/g, function(txt, key) {
		if(values.hasOwnProperty(key)) {
			return this.escapeId(values[key]);
		}

		return txt;
	}.bind(this));


	return replaceId.replace(/\:(\w+)/g, function(txt, key) {
		if(values.hasOwnProperty(key)) {
			return this.escape(values[key]);
		}

		return txt;
	}.bind(this));
}


function getConfig() {
	if(!config.database || config.database.client !== 'mysql') {
		errors.logErrorAndExit(new Error('目前数据库只支持mysql。'));
	}

	try {
		return _.assign(config.database.connection, {
			debug: config.database.debug || false,
			queryFormat: queryFormat
		});
	} catch(err) {
		errors.logErrorAndExit(err, err.context, '请检测config.js文件的database信息。');
	}	
}


var pool = mysql.createPool(getConfig());
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
Promise.promisifyAll(require('mysql/lib/Connection').prototype);


module.exports = {
	format: function() {
		return queryFormat.apply(mysql, arguments);
	},

	escape: function() {
		return mysql.escape.apply(mysql, arguments);
	},

	escapeId: function() {
		return mysql.escapeId.apply(mysql, arguments);
	},

	getConn: function() {
		return pool.getConnectionAsync().disposer(function(conn) {
			conn.release();
		});
	}
};
