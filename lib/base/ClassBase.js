var util = require('util');

module.exports = {


	/**
	 * 定义一个类
	 * @param  {String}	类名称
	 * @return {Object} 新建的类
	 */
	define: (function() {
		// Creates a constructor that has nothing extra in its scope chain.
		function makeCtor (className) {
		    function constructor () {
		        // Opera has some problems returning from a constructor when Dragonfly isn't running. The || null seems to
		        // be sufficient to stop it misbehaving. Known to be required against 10.53, 11.51 and 11.61.
		        return this.constructor.apply(this, arguments) || null;
		    }

		    return constructor;
		}


		return function(className, data) {

			//判断是否存在
			if(className && util.isString(className)) {
				var obj = ClassManager.get(className);

				if(obj) {
					throw new Error('[' + className + '] 已存在！');
				}
			} else {
				throw new Error('第一个参数不合法！');
			}


			if(!util.isObject(data)) {
				throw new Error('第二个参数不合法！');
			}


			//获取父类
			var superclass = function() {}, 
				extend = data.extend;

			delete data.extend;
			if(extend) {
				superclass = ClassManager.get(extend);
				if(!superclass) {
					throw new Error('[' + extend + '] 不存在！');
				}
			}

			//创建子类
			var F = function() {},
				superclassProto = superclass.prototype,
				subclass = makeCtor(className),
				statics = data.statics,
				member, name;

			//加入静态成员
			delete data.statics;
			if(statics) {
				for(name in statics) {
					if(statics.hasOwnProperty(name)) {
						member = statics[name];
						subclass[name] = member;
					}
				}				
			}


			//加入成员
			data.$className = className;
			for(name in data) {
				if(data.hasOwnProperty(name)) {
					member = data[name];
					superclassProto[name] = member;
				}
			}

			F.prototype = superclassProto;
			subclass.prototype = new F();
			//subclass.superclass = superclass;

			ClassManager.add(subclass);
			
			return subclass;
		};
	})()
};