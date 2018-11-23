var Promise = require('bluebird');
var config = require('./config.js').config;

var currentState;

module.exports = function(deviceType) {
	
	currentState = {
		isPlaying : false,
		isMuted : false,
		currentTrack : null,
		currentTrackIsTextToSpeech : false,
		positionOfFirstTextToSpeechTrack : 0,
		volume : 0
	};
	
	return getPositionOfFirstTextToSpeechTrack(deviceType)
		.then(positionOfFirstTextToSpeechTrack => {
			currentState.positionOfFirstTextToSpeechTrack = positionOfFirstTextToSpeechTrack;
			return gladys.modules.sonos.music.getVolume(deviceType);
		})
		.then(volume => {
			currentState.volume = volume;
			return gladys.modules.sonos.music.getCurrentTrack(deviceType);
		})
		.then(currentTrack => {
			currentState.currentTrack = currentTrack;
			return gladys.modules.sonos.music.getPlaying(deviceType);
		})
		.then(isPlaying => {
			currentState.isPlaying = isPlaying.playing;
			return gladys.modules.sonos.music.getMuted(deviceType);
		})
		.then(isMuted => {
			currentState.isMuted = isMuted;
			return checkIfCurrentTrackIsTextToSpeech();
		})
		.then(currentTrackIsTextToSpeech => {
			currentState.currentTrackIsTextToSpeech = currentTrackIsTextToSpeech;
			return Promise.resolve(currentState);
		});
};

function getPositionOfFirstTextToSpeechTrack(deviceType) {
	return gladys.modules.sonos.music.getQueue(deviceType)
		.then(queue => Promise.resolve(queue.length + 1))
		.catch(() => Promise.resolve(1));
}

function checkIfCurrentTrackIsTextToSpeech() {
	if (currentState.currentTrack.queuePosition !== 0) {
		return Promise.resolve(currentState.currentTrack.title.substring(0, config.prefixMp3FileDownloaded.length) === config.prefixMp3FileDownloaded);
	}
	
	return Promise.resolve(false);
}