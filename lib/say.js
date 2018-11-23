var Promise = require('bluebird');
var download = require('./download.js');
var splitText = require('./splitText.js');
var resumePlaylist = require('./resumePlaylist.js');
var getCurrentState = require('./getCurrentState.js');

module.exports = function(params){

	var deviceType = {deviceType : {device : params.device}};
	
	return getCurrentState(deviceType)
		.then(currentState => [currentState, splitText(params.text)])
		.spread((currentState, texts) => [currentState, Promise.mapSeries(texts, text => download(params.language, text))])
		.spread((currentState, filesName) =>
			[
				currentState,
				gladys.param.getValue('SPEAK-SONOS_PATH_MP3')
					.then(sonosPath => Promise.mapSeries(
						filesName,
						fileName => gladys.modules.sonos.music.queue({
									uri : `x-file-cifs:${sonosPath}${fileName}`,
									deviceType : deviceType.deviceType
								})
					))
			]
		)
		.spread(currentState => {
			if (currentState.currentTrackIsTextToSpeech) {
				return Promise.resolve([currentState]);
			}
			else {
				return [
					currentState,
					gladys.modules.sonos.music.selectTrack({trackNumber : currentState.positionOfFirstTextToSpeechTrack, deviceType : deviceType.deviceType})
				];
			}
		})
		.spread(currentState => [
				currentState,
				gladys.param.getValue('SPEAK-SONOS_DEFAULT_VOLUME')
					.then(defaultVolume => gladys.modules.sonos.music.setVolume({volume : params.volume || defaultVolume, deviceType : deviceType.deviceType}))
			]
		)
		.spread(currentState => [
				currentState,
				gladys.modules.sonos.music.setMuted({muted : false, deviceType : deviceType.deviceType})
			]
		)
		.spread(currentState => {
			if (currentState.currentTrackIsTextToSpeech) {
				return Promise.resolve([currentState]);
			}
			else {
				return [
					currentState,
					gladys.modules.sonos.music.play(deviceType)
				];
			}
		})
		.spread(currentState => {
			if (currentState.currentTrackIsTextToSpeech) {
				return Promise.resolve();
			}
			else {
				return resumePlaylist(deviceType, currentState);
			}
		});
};