var Promise = require('bluebird');

module.exports = function(text) {
	
	var nbCharactersMax = 100;
	var punctuationsSearch = ['.', ',', ';', ':', '!', '?'];
	var otherSearch = [' '];
	var texts = [];

	while (text.length !== 0) {
		if (text.length > nbCharactersMax) {
			var ponctuationFound = false;
			var xFirstCharacters = text.substring(0, nbCharactersMax);
			for (var i = nbCharactersMax - 1; i > 0; i--) {
				if (punctuationsSearch.includes(xFirstCharacters[i])) {
					texts.push(xFirstCharacters.substring(0, i));
					text = text.substring(i + 1, text.length).trim();
					ponctuationFound = true;
					break;
				}
			}
			
			for (var i = nbCharactersMax - 1; i > 0 && ponctuationFound == false; i--) {
				if (otherSearch.includes(xFirstCharacters[i])) {
					texts.push(xFirstCharacters.substring(0, i));
					text = text.substring(i + 1, text.length).trim();
					break;
				}
			}
		}
		else {
			texts.push(text);
			break;
		}
	}
	
	return Promise.resolve(texts);
};