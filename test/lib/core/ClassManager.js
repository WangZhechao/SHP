var ClassManager = require('../../../lib/core/ClassManager.js'),
	should = require('should'),
	assert = require('assert');


describe('lib/core/ClassManager.js', function() {

	after(function(done) {
		ClassManager.removeAll();
		done();
	});

	it('add', function() {
		var obj = ClassManager.add();
		assert.equal(obj, null);
	});

	it('add', function() {
		var obj = ClassManager.add(function(){});
		assert.equal(obj, null);
	});

	it('add', function() {

		var Test = function() {
			this.name = 'test';
		};
		Test.$className = 'Test';

		var obj = ClassManager.add(Test);
		obj.should.have.property('$className', 'Test');
	});

	it('get', function() {
		var obj = ClassManager.get();
		assert.equal(obj, null);
	});

	it('get', function() {
		var obj = ClassManager.get('mock');
		assert.equal(obj, null);
	});

	it('get', function() {
		var obj = ClassManager.get('Test');
		obj.should.have.property('$className', 'Test');
	});
});