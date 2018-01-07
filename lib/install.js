var fse = require('fs-extra');
var config = require('./config.js').config;

module.exports = function(){
	fse.mkdirsSync(config.downloadMp3Destination);
	
	var type = {
		name: 'Speak (Google Voice) for Sonos',
		service: 'speak-sonos'
	};

	return gladys.notification.install(type);
};