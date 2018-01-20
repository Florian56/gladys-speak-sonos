var Promise = require('bluebird');

module.exports = function(deviceType, firstTtsTrackQueuePosition, isPlaying, currentTrack, volume, isMuted) {
	
	return resumePlaylist(deviceType, firstTtsTrackQueuePosition, isPlaying, currentTrack, volume, isMuted);
};

function resumePlaylist(deviceType, firstTtsTrackQueuePosition, isPlaying, currentTrack, volume, isMuted) {
	return gladys.modules.sonos.music.getCurrentTrack(deviceType)
		.then(currentTtsTrack => [gladys.modules.sonos.music.getQueue(deviceType), currentTtsTrack])
		.spread((queue, currentTtsTrack) => {
			if (currentTtsTrack.queuePosition === queue.length) {
				setTimeout(() => {
					return removeAllTtsTracks(deviceType, firstTtsTrackQueuePosition, queue.length)
						.then(() => gladys.modules.sonos.music.selectTrack({trackNumber : currentTrack.queuePosition, deviceType : deviceType.deviceType}))
						.then(() => gladys.modules.sonos.music.seek({seconds : currentTrack.position, deviceType : deviceType.deviceType}))
						.then(() => gladys.modules.sonos.music.setVolume({volume : volume, deviceType : deviceType.deviceType}))
						.then(() => gladys.modules.sonos.music.setMuted({muted : isMuted, deviceType : deviceType.deviceType}))
						.then(() => {
							if (isPlaying.playing) {
								return gladys.modules.sonos.music.play(deviceType);
							}
							else {
								return gladys.modules.sonos.music.pause(deviceType);
							}
						});
				}, (currentTtsTrack.duration * 1000) + 500);
			}
			else {
				setTimeout(
					() => resumePlaylist(deviceType, firstTtsTrackQueuePosition, isPlaying, currentTrack, volume, isMuted),
					(currentTtsTrack.duration * 1000) + 50);
			}
		});
}

function removeAllTtsTracks(deviceType, firstTtsTrack, lastTtsTrack) {
	var tracksIndex = [];
	for (var index = lastTtsTrack; index >= firstTtsTrack; index--) {
		tracksIndex.push(index);
	}
	
	return Promise.mapSeries(
		tracksIndex,
		index => gladys.modules.sonos.music.removeTrackFromQueue({trackNumber : index, deviceType : deviceType.deviceType})
	);
}