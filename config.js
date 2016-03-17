
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

	updateCheck: true,
	update: {
		url: 'http://127.0.0.1:8081/update.json',
		version: '0.0.1',
		checkTime: 60 * 1000
	},

	logging: true
};