var fse = require('fs-extra');
var config = require('./config.js').config;
var queries = require('./queries.js');

module.exports = function(){
	fse.removeSync(config.downloadMp3Destination);
	
	return gladys.utils.sql(queries.deleteNotificationUser, [config.serviceName])
		.then(() => gladys.utils.sql(queries.deleteNotificationType, [config.serviceName]));
};