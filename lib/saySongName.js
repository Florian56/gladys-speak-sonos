var say = require('./say.js');

module.exports = function(params) {	
	return gladys.modules.sonos.music.getCurrentTrack({deviceType : {device : params.device}})
		.then((currentTrack) => {
			var message = `Vous écoutez ${currentTrack.title} de ${currentTrack.artist}.`;
			return gladys.modules['speak-sonos'].say({text : message, language : params.language, device : params.device});
		});
};