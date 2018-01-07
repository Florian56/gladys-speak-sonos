var download = require('./download.js');

module.exports = function(params){

	// first, we download the file
	// or take it from cache
	return download(params.language, params.text)
		.then(function(fileName) {
			var currentTrack;
			var isPlaying;
			var ttsTrackQueuePosition;
			var deviceType = {deviceType : {device : params.device}};

			return gladys.modules.sonos.music.getCurrentTrack(deviceType)
				.then((current) => {
					currentTrack = current;
					return gladys.modules.sonos.music.getPlaying(deviceType);
				})
				.then((playing) => {
					isPlaying = playing;
					return gladys.param.getValue('SPEAK-SONOS_PATH_MP3');
				})
				.then((pathForSonos) => {
					return gladys.modules.sonos.music.queue({uri : `x-file-cifs:${pathForSonos}${fileName}`, deviceType : deviceType.deviceType});
				})
				.then(() => {
					return gladys.modules.sonos.music.getQueue(deviceType);
				})
				.then((queue) => {
					ttsTrackQueuePosition = queue.length;
					return gladys.modules.sonos.music.selectTrack({trackNumber : queue.length, deviceType : deviceType.deviceType});
				})
				.then(() => {
					return gladys.modules.sonos.music.play(deviceType);
				})
				.then(() => {
					return gladys.modules.sonos.music.getCurrentTrack(deviceType);
				})
				.then((ttsTrack) => {
					setTimeout(() => {
						gladys.modules.sonos.music.removeTrackFromQueue({trackNumber : ttsTrackQueuePosition, deviceType : deviceType.deviceType})
							.then(() => {
								return gladys.modules.sonos.music.selectTrack({trackNumber : currentTrack.queuePosition, deviceType : deviceType.deviceType});
							})
							.then(() => {
								return gladys.modules.sonos.music.seek({seconds : currentTrack.position, deviceType : deviceType.deviceType});
							})
							.then(() => {
								if (isPlaying.playing) {
									return gladys.modules.sonos.music.play(deviceType);
								}
								else {
									return gladys.modules.sonos.music.pause(deviceType);
								}
							});
					}, (ttsTrack.duration * 1000) + 1000);
				});
		});
};