var util = require('util');

module.exports = (function() {

	/**
	 * 类集合
	 * @type {Object}
	 */
	var classes = {
		'Class': null,
		'ClassManager': null
	};



	/**
	 * 管理类
	 * @type {Object}
	 */
	var ClassManager = {

		/**
		 * 加入类
		 * @param {Object} value 类
		 */
		add: function(value) {
			if(!util.isFunction(value)) {
				return null;
			}

			var name = value && value.$className || '';
			if(!name || classes[name]) {
				return null;
			}

			classes[name] = value;

			return classes[name];
		},


		/**
		 * 获取一个类
		 * @param  {String} name 类名
		 * @return {Object}      类
		 */
		get: function(name) {
			return classes[name] || null;
		},


		/**
		 * 移除所有
		 */
		removeAll: function() {
			classes = {};
		}
	};


	return ClassManager;
})();