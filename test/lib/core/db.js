var Promise = require('bluebird'),
	should = require('should'),
	assert = require('assert'),
	currentEnv     = process.env.NODE_ENV;

describe('lib/core/db.js', function() {
	var db, 
	resetEnvironment = function () {
	    process.env.NODE_ENV = currentEnv;
	};

	beforeEach(function () {
		process.env.NODE_ENV = 'testing';
		db = require('../../../lib/core/db.js');
	});

	afterEach(function () {
	    resetEnvironment();
	});

	it('format', function() {
		var sql = 'SELECT * FROM ?? WHERE id = ?';
		sql = db.format(sql, ['t_test', 5]);

		assert.equal(sql, 'SELECT * FROM `t_test` WHERE id = 5');
	});


	it('format', function() {
		var sql = 'SELECT * FROM ::table WHERE id = :id';
		sql = db.format(sql, {
			table: 't_test',
			id: 5
		});

		assert.equal(sql, 'SELECT * FROM `t_test` WHERE id = 5');
	});


	it('escape', function() {
		var sql = 'SELECT * FROM `t_test` WHERE id = ' + db.escape(5);

		assert.equal(sql, 'SELECT * FROM `t_test` WHERE id = 5');
	});


	it('escapeId', function() {
		var sql = 'SELECT * FROM ' + db.escapeId('t_test') + ' WHERE id = 5';

		assert.equal(sql, 'SELECT * FROM `t_test` WHERE id = 5');
	});


	// it('getConn', function(done) {
	// 	return Promise.using(db.getConn(), function(conn) {
	// 		obj.should.have.property(conn, 'query');
	// 		//done();
	// 	});
	// });
});