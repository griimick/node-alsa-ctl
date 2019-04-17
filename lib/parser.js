const { keyValueParser, valuesLineParser, itemLineParser }  = require ('./parser-utils');

exports = module.exports = {};
exports.aplayParser = aplayParser;
exports.amixerParser = amixerParser;

/*
 * Parse card number, device number, soundcard name and device name from the aplay output
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

		let _card = line.match (/card (\d+):/)[1];
		let _device = line.match (/device (\d+):/)[1];
		let _names = line.match (/\[(.*?)\]/g);
		let _device_name = _names[1].slice (1, -1);
		let _soundcard_name = _names[0].slice (1, -1);

		devices.push ({ cardNumber: _card, deviceNumber: _device, deviceName: _device_name });
		_soundcards_map[_card] = ({ cardNumber: _card, soundcardName: _soundcard_name });
	});

	soundcards = Object.keys (_soundcards_map).map (function (key) {
		return _soundcards_map[key];
	});

	return { devices, soundcards };
}

/*
 * Parse all contents of stdout from amixer for a particular card
 */
function amixerParser (stdout) {

	let controls = [];
	let ctrlLines = stdout.split ('\n');
	let control = {};

	for (let i = 0; i < ctrlLines.length; i++) {

		let parsedLineHead;
		lineHead = ctrlLines[i].trim ();

		if (!/^numid=.*$/.test (lineHead))
			break;

		parsedLineHead = keyValueParser (lineHead);
		control = { ...control, ...parsedLineHead };


		for (let j = i + 1; j < ctrlLines.length; j++) {

			let parsedLineContent;
			lineContent = ctrlLines[j].trim ();

			if (/^numid=.*$/.test (lineContent)) {
				i = j-1;
				controls.push (control);
				control = {};
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

			} else if (/^; Item #.*$/.test (lineContent)) {

				if (!control.hasOwnProperty('items'))
					control.items = [];
				lineContent = lineContent.slice (2);
				parsedLineContent = itemLineParser (lineContent);
				control.items.push (parsedLineContent);
				continue;
			}
		}
	}

	controls.push (control);

	return controls;
}

