
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
		update: 'http://127.0.0.1:8081/update.json',
		md5: '07312fb8769d3d38bdf5d374dcaffc5c',
		version: '0.0.1'
	},

	logging: true
};