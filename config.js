
/**
 * Server Configuration
 */

module.exports = {
	server: {
	    host: '127.0.0.1',
	    port: '2368',

	    compress: true,
	    proxy: false
	},

	database: {
	    client: 'mysql',
	    connection: {
	        host     : 'host',
	        user     : 'user',
	        password : 'password',
	        database : 'database',
	        charset  : 'utf8'
	    },
	    debug: false
	},


	logging: true
};