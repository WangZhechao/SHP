var _ = require('lodash');

function json(apiMethod) {
	return apiMethod;
}

function html(apiMethod) {
	return apiMethod;
}

module.exports = {
	json: json,
	html: html
};