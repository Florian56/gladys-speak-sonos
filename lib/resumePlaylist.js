var Promise = require('bluebird');

module.exports = function(deviceType, currentState) {
	
	return resumePlaylist(deviceType, currentState);
};

function resumePlaylist(deviceType, currentState) {
	return gladys.modules.sonos.music.getCurrentTrack(deviceType)
		.then(currentTextToSpeechTrack => [gladys.modules.sonos.music.getQueue(deviceType), currentTextToSpeechTrack])
		.spread((queue, currentTextToSpeechTrack) => {
			if (currentTextToSpeechTrack.queuePosition === queue.length) {
				setTimeout(() => {
					return removeAllTextToSpeechTracks(deviceType, currentState.positionOfFirstTextToSpeechTrack, queue.length)
						.then(() => {
							if (currentState.currentTrack.queuePosition !== 0) {
								return gladys.modules.sonos.music.selectTrack({trackNumber : currentState.currentTrack.queuePosition, deviceType : deviceType.deviceType});
							}
							
							return Promise.resolve();
						})
						.then(() => {
							if (currentState.currentTrack.queuePosition !== 0) {
								return gladys.modules.sonos.music.seek({seconds : currentState.currentTrack.position, deviceType : deviceType.deviceType});
							}
							
							return Promise.resolve();
						})
						.then(() => gladys.modules.sonos.music.setVolume({volume : currentState.volume, deviceType : deviceType.deviceType}))
						.then(() => gladys.modules.sonos.music.setMuted({muted : currentState.isMuted, deviceType : deviceType.deviceType}))
						.then(() => {
							if (currentState.currentTrack.queuePosition !== 0) {
								if (currentState.isPlaying) {
									return gladys.modules.sonos.music.play(deviceType);
								}
								else {
									return gladys.modules.sonos.music.pause(deviceType);
								}
							}
							
							return Promise.resolve();
						});
				}, (currentTextToSpeechTrack.duration * 1000) + 1000);
			}
			else {
				setTimeout(
					() => resumePlaylist(deviceType, currentState),
					(currentTextToSpeechTrack.duration * 1000) + 50);
			}
		});
}

function removeAllTextToSpeechTracks(deviceType, firstTextToSpeechTrack, lastTextToSpeechTrack) {
	var tracksIndex = [];
	for (var index = lastTextToSpeechTrack; index >= firstTextToSpeechTrack; index--) {
		tracksIndex.push(index);
	}
	
	return Promise.mapSeries(
		tracksIndex,
		index => gladys.modules.sonos.music.removeTrackFromQueue({trackNumber : index, deviceType : deviceType.deviceType})
	);
}