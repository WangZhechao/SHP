var _ = require('lodash'),
	Promise = require('bluebird'),
	mysql = require('mysql'),
	config = require('../config'),
	errors = require('../errors');


function getConfig() {
	if(!config.database || config.database.client !== 'mysql') {
		errors.logErrorAndExit(new Error('目前数据库只支持mysql。'));
	}

	try {
		return _.assign(config.database.connection, 
			{debug: config.database.debug || false});
	} catch(err) {
		errors.logErrorAndExit(err, err.context, '请检测config.js文件的database信息。');
	}	
}


var pool = mysql.createPool(getConfig());
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
Promise.promisifyAll(require('mysql/lib/Connection').prototype);


module.exports = Class.define('BaseDb', {
	format: function() {
		return mysql.format.apply(mysql, arguments);
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
});
