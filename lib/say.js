var Promise = require('bluebird');
var download = require('./download.js');
var splitText = require('./splitText.js');
var resumePlaylist = require('./resumePlaylist.js');
var config = require('./config.js').config;

module.exports = function(params){

	var firstTtsTrackQueuePosition;
	var deviceType = {deviceType : {device : params.device}};
	
	return gladys.modules.sonos.music.getQueue(deviceType)
		.then(queue => {
			firstTtsTrackQueuePosition = queue.length + 1;
			return splitText(params.text);
		})
		.then(texts => Promise.mapSeries(texts, text => download(params.language, text)))
		.then(filesName => [gladys.param.getValue('SPEAK-SONOS_PATH_MP3'), filesName])
		.spread((sonosPath, filesName) => {
			return Promise.mapSeries(
				filesName,
				fileName => gladys.modules.sonos.music.queue({
							uri : `x-file-cifs:${sonosPath}${fileName}`,
							deviceType : deviceType.deviceType
						})
			);
		})
		.then(() => gladys.modules.sonos.music.getCurrentTrack(deviceType))
		.then(currentTrack => 
			[
				gladys.modules.sonos.music.getPlaying(deviceType),
				currentTrack,
				currentTrack.title.substring(0, config.prefixMp3FileDownloaded.length) === config.prefixMp3FileDownloaded
			]
		)
		.spread((isPlaying, currentTrack, currentTrackIsTts) => {
			if (currentTrackIsTts) {
				return Promise.resolve([isPlaying, currentTrack, currentTrackIsTts]);
			}
			else {
				return [
					isPlaying,
					currentTrack,
					currentTrackIsTts,
					gladys.modules.sonos.music.selectTrack({trackNumber : firstTtsTrackQueuePosition, deviceType : deviceType.deviceType})
				];
			}
		})
		.spread((isPlaying, currentTrack, currentTrackIsTts) => {
			if (currentTrackIsTts) {
				return Promise.resolve([isPlaying, currentTrack, currentTrackIsTts]);
			}
			else {
				return [
					isPlaying,
					currentTrack,
					currentTrackIsTts,
					gladys.modules.sonos.music.play(deviceType)
				];
			}
		})
		.spread((isPlaying, currentTrack, currentTrackIsTts) => {
			if (currentTrackIsTts) {
				return Promise.resolve();
			}
			else {
				return resumePlaylist(deviceType, firstTtsTrackQueuePosition, isPlaying, currentTrack);
			}
		});
};