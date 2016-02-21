/**
 * 定义基础模型
 */

var DB = require('./db.js');

module.exports = Class.define('BaseModel', {
	db: new DB()
});
