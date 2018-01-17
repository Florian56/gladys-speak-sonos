var fse = require('fs-extra');
var config = require('./config.js').config;

module.exports = function(){
	fse.mkdirsSync(config.downloadMp3Destination);
	
	var type = {
		name: config.serviceDescription,
		service: config.serviceName
	};

	return gladys.notification.install(type);
};