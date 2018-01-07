var http = require('http');
var fs = require('fs');
var md5 = require('md5');
var config = require('./config.js').config;

module.exports = function (language, text){

	var options = {
		hostname: `translate.google.com`,
		path: `/translate_tts?tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`,
		method: 'GET',
		headers: {'user-agent': 'Mozilla/5.0'},
	};

	var fileName = config.prefixMp3FileDownloaded + md5(language + text) + '.mp3';
	var destination = `${config.downloadMp3Destination}${fileName}`;

	// downloading and saving file
	return new Promise(function(resolve, reject) {

		// we test first if the file does not already exist
		fs.exists(destination, function(exists) { 
		  
			// if the file already exist
			if (exists) { 
				console.log('[speak-sonos] Using cache, file already exist.');
				return resolve(fileName);
			}
			else {
				// else, we download it
				var request = http.get(options, function(response) {
					if(response.statusCode >= 200 && response.statusCode < 300) {
						var file = fs.createWriteStream(destination);
						response.pipe(file);
						
						file.on('finish', function() {
							file.close();
						});
						file.on('close', function() {
							resolve(fileName);
						});
					}
					else {
						reject(new Error('Fail downloading'));
					}
				});
			}
		});
	});
};