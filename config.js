
/**
 * Server Configuration
 */

module.exports = {
	server: {
	    host: '127.0.0.1',
	    port: '3000',

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

	cookie: {
		secret: 'plus',
		key: 'plus-cookie'
	},

	app: {
		update: 'http://127.0.0.1:3000/',
		md5: '12345636456567',
		version: '0.0.1'
	},

	logging: true
};