const { keyValueParser, valuesLineParser }  = require('./kv-parser');

exports = module.exports = {};
exports.aplayParser = aplayParser;
exports.amixerParser = amixerParser;

/*
 * Parse card number, device number and device name from the aplay output
 */
function aplayParser (stdout) {

	let deviceLinesArr = [], devices = [], soundcards = [], _soundcards_map = {};
	let lines = stdout.split ('\n');

	/*
	 * Parse all lines with the card description from aplay output
	 */
	lines.forEach ((line) => {
		if (line.match (/^card [0-9]+:.*\[.*\], device [0-9]+:.*\[.*\]$/))
			deviceLinesArr.push (line);
	});

	/*
	 * Parse out card number and device number from card description lines
	 */
	deviceLinesArr.forEach ((line) => {

		let _card = line.match(/card (\d+):/g)[0];
		let _device = line.match(/device (\d+):/g)[0];
		let _names = line.match(/\[(.*?)\]/g);
		let _device_name = _names[0];
		let _soundcard_name = _names[1];

		devices.push ({ cardNumber: _card, deviceNumber: _device, deviceName: _device_name });
		_soundcards_map[_card] = ({ cardNumber: _card, soundcardName: _soundcard_name });
	});

	soundcards = Object.keys(_soundcards_map).map(function(key) {
		return [Number(key), _soundcards_map[key]];
	});

	return { devices, soundcards };
}

/*
 * Parse only Master control for each card for now
 * TODO: Support all playback options available with Playback channels support
 */
function amixerParser (stdout) {

	controls = [];
	let ctrlLines = stdout.split ('\n');

	for (let i = 0; i < ctrlLines.length; i++) {

		let control = {}, parsedLineHead;
		lineHead = ctrlLines[i].trim ();

		if (!/^numid=.*$/.test (lineHead)) {
			break;
		}

		parsedLineHead = keyValueParser (lineHead);
		control = { ...control, ...parsedLineHead };


		for (let j = i + 1; j < ctrlLines.length; j++) {

			let parsedLine;
			lineContent = ctrlLines[j].trim ();

			if (/^numid=.*$/.test (lineContent)) {

				i = j-1;
				controls.push (control);
				break;

			} else if (/^; type=.*$/.test (lineContent)) {

				lineContent = lineContent.slice (2);
				parsedLineContent = keyValueParser (lineContent);
				control = { ...control, ...parsedLineContent };
				continue;

			} else if (/^: values=.*$/.test (lineContent)) {

				let valuesType = (control.type) ? control.type : null;
				lineContent = lineContent.slice (2);
				parsedLineContent = valuesLineParser (lineContent, valuesType);
				control = { ...control, ...parsedLineContent };
				continue;

			}
		}
	}

	return controls;
}
