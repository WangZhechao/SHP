// SET FOREIGN_KEY_CHECKS=0;

// -- ----------------------------
// -- Table structure for t_web_sessions
// -- ----------------------------
// DROP TABLE IF EXISTS `t_web_sessions`;
// CREATE TABLE `t_web_sessions` (
//   `session_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
//   `expires` int(11) unsigned NOT NULL,
//   `data` text,
//   PRIMARY KEY (`session_id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

var maxExpiration = 86400000 * 30;
var checkExpirationInterval = 900000;


module.exports = function(connect) {

	var Store = connect.session.Store;

	function MysqlStore() {
		this.setExpirationInterval();
	}

	MysqlStore.prototype.__proto__ = Store.prototype;


	MysqlStore.prototype.get = function(sid, cb) {
		var sql = 'SELECT `data` FROM `t_web_sessions` WHERE `session_id` = ? LIMIT 1',
			params = [sid];

		sql = DB.format(sql, params);

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql, function(rows) {
				var session;

				try {
					session = !!rows[0] ? JSON.parse(rows[0].data) : null;
				} catch(err) {
					return cb && cb(err, null);
				}

				return session;
			});
		}).then(function(session) {
			return cb && cb(null, session);
		}).catch(function(e) {
			return cb && cb(err, null);
		});
	};



	MysqlStore.prototype.set = function(sid, data, cb) {
		var maxAge, expries, params, sql;

		try {
			maxAge = data.cookie.maxAge | 86400000;
			expires = new Date(Date.now() + maxAge);
			expires = Math.round(expires.getTime() / 1000);

			params = {
				session_id: sid,
				expires: expires,
				data: JSON.stringify(data)
			};

		}catch(err) {
			cb && cb(err);
		}

		
		sql = 'REPLACE INTO `t_web_sessions` SET ?';
		sql = DB.format(sql, params);

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql);
		}).then(function() {
			return cb && cb(null, null);
		}).catch(function(err) {
			return cb && cb(err, null);
		});
	};


	MysqlStore.prototype.destroy = function(sid, cb) {
		var sql = 'DELETE FROM `t_web_sessions` WHERE `session_id` = ? LIMIT 1',
			params = [sid];

		sql = DB.format(sql, params);

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql);
		}).then(function() {
			return cb && cb(null, null);
		}).catch(function(err) {
			return cb && cb(err, null);
		});
	};


	MysqlStore.prototype.length = function(cb) {
		var sql = 'SELECT COUNT(*) AS `count` FROM `t_web_sessions`';

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql);
		}).then(function(rows) {
			var count = !!rows[0] ? rows[0].count : 0;

			return cb && cb(null, count);
		}).catch(function(err) {
			return cb && cb(err, null);
		});
	};


	MysqlStore.prototype.clear = function(cb) {
		var sql = 'DELETE FROM `t_web_sessions`';

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql);
		}).then(function() {
			return cb && cb(null, null);
		}).catch(function(err) {
			return cb && cb(err, null);
		});
	};


	MysqlStore.prototype.clearExpiredSessions = function(cb) {
		var sql = 'DELETE FROM `t_web_sessions` WHERE `expires` < ?',
			params = [ Math.round(Date.now() / 1000) ];

		sql = DB.format(sql, params);

		DB.using(DB.getConn(), function(conn) {
			return conn.query(sql);
		}).then(function() {
			return cb && cb(null, null);
		}).catch(function(err) {
			return cb && cb(err, null);
		});
	};


	MysqlStore.prototype.setExpirationInterval = function(interval) {
		var self = this;

		self.clearExpirationInterval();
		
		self._expirationInterval = setInterval(function() {
			
			self.clearExpiredSessions();

		}, interval || checkExpirationInterval);		
	};


	MysqlStore.prototype.clearExpirationInterval = function() {
		clearInterval(this._expirationInterval);
	};


	return MysqlStore;
};