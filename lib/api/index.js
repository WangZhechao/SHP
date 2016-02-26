var _ = require('lodash'),
	errors = require('../errors');

function json(apiMethod) {

	return function(req, res, next) {
		var object = req.body,
		    options = _.assignIn({}, req.files, req.query, req.params, {
		    	path: req.path,
		    	method: req.method
		    });

		//GET,DELETE  ->  req.body is null.
		//PUT,POST,PATCH  ->  req.body is an object
		if(_.isEmpty(object)) {
			object = options;
			options = {};
		}

		if(!_.isFunction(apiMethod)) {
			return errors.logErrorAndExit(new Error('路由处理函数格式错误！'), '',
			 '路由函数绑定支持{view: function}/{json: function}/function/...');
		}

		return apiMethod(object, options).then(function(response) {
			res.json(response || {});
		}).catch(function onAPIError(error) {
            // To be handled by the API middleware
            next(error);
        });
	};
}

function html(apiMethod) {

	return function(req, res, next) {
		var object = req.body,
		    options = _.assignIn({}, req.files, req.query, req.params, {
		    	//添加当前用户信息
		    });

	    if(!_.isFunction(apiMethod)) {
	    	return errors.logErrorAndExit(new Error('路由处理函数格式错误！'), '',
	    	 '路由函数绑定支持{view: function}/{json: function}/function/...');
	    }

		return apiMethod(options).then(function(templateData) {
			var view = templateData.view || '404.ejs';
			var locals = templateData.locals || {};

			res.render(view, locals);

		}).catch(function onAPIError(error) {
            // To be handled by the API middleware
            next(error);
        });
	};
}

module.exports = {
	json: json,
	html: html
};