var ClassManager = require('../../../lib/core/ClassManager.js'),
	ClassBase = require('../../../lib/core/ClassBase.js'),
	should = require('should'),
	assert = require('assert');


describe('lib/core/ClassBase.js', function() {
	before(function(done) {
		var Base = function() {
			this.name = 'base';
		};
		Base.$className = 'Base';

		ClassManager.add(Base);
		done();
	});

	after(function(done) {
		ClassManager.removeAll();
		done();
	});

	it('define', function() {
		(ClassBase.define).should.throw();
	});

	it('define', function() {
		(function() {ClassBase.define('Test');}).should.throw();
	});

	it('define', function() {
		(function() {ClassBase.define('Base', {pro: 1});}).should.throw();
	});

	it('define', function() {
		var obj = ClassBase.define('obj', {
			pro: 1
		});

		obj.prototype.should.have.property('pro', 1);
	});


	it('define', function() {
		(function() {
			ClassBase.define('exist', {
				extend: 'not'
			});
		}).should.throw();
	});


	it('define', function() {
		var Class = ClassBase.define('Exist', {
			extend: 'Base',

			someProperty: 'something',

			someMethod: function() {
				return someProperty;
			},

			statics: {
				staticProperty: 'something',

				staticMethod: function () {

				}
			}
		});

		Class.prototype.should.have.properties(['someProperty', 'someMethod', '$className']);
		Class.should.have.properties(['staticProperty', 'staticMethod']);
		(new Class()).should.have.property('name', 'base');
	});
});