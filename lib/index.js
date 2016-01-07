/*
 * Server Loader
 */

 var server = require('./core');

//set the default enviromnet to be `development`
 process.env.NODE_ENV = process.env.NODE_ENV || 'development';


 function makeServer(options) {
 	options = options || {};

 	return server(options);
 }

 module.exports = makeServer;