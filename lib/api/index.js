var _ = require('lodash');

function json(apiMethod) {

	return function(req, res) {
		var object = req.body,
		    options = _.assignIn({}, req.files, req.query, req.params, {
		    	//添加当前用户信息
		    });

		//GET,DELETE  ->  req.body is null.
		//PUT,POST,PATCH  ->  req.body is an object
		if(_.isEmpty(object)) {
			object = options;
			options = {};
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

	return function(req, res) {
		var object = req.body,
		    options = _.assignIn({}, req.files, req.query, req.params, {
		    	//添加当前用户信息
		    });

		return apiMethod(options).then(function(templateData) {
			var view = templateData.view;
			var locals = templateData.locals;

			res.render(view || '404.ejs', locals);

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