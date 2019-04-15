const { promisify } = require('util');
const exec = promisify (require ('child_process').exec)

/*
 * Initialize temporary cache list as null for first init
 */
let listDevices = null;

exports = module.exports = {};
exports.getDevices = getDevices;
exports.getAmixer = getAmixer;

/*
 * soundDevice strucutre with getter functions
 */
function soundDevice (device) {
	this._raw = device;
	this.getCardNumber = () => device.cardNumber;
	this.getDeviceNumber = () => device.deviceNumber;
	this.getName = () => device.name;
}

/*
 * Get sound devices from "aplay -l"
 */
async function getDevices (force) {

	if (!force && listDevices !== null)
		return listDevices;

	listDevices = [];

	let rawListDevices = [];
	let { stdout, strerr } = await exec ('aplay -l');

	rawListDevices = parseAplayOut (stdout);

	rawListDevices.forEach ((device) => {
		listDevices.push (new soundDevice (device));
	});
	listDevices._raw = rawListDevices;

	return listDevices;
}

/*
 * Parse Amixer output (parsing only Master for now)
 * TODO: Support all playback options available with Playback channels support
 */
async function getAmixer (cardNumber) {

	let { stdout, strerr } = await exec ('amixer -c' + cardNumber );

	controls = parseControlContent (stdout);

	return controls;
}


/*
 * Parse only Master control for each card for now
 * TODO: Support all playback options available with Playback channels support
 */
function parseControlContent (stdout) {

	controls = {};
	let ctrlLinesArr = stdout.split ('\n');

	for (let i = 0; i < ctrlLinesArr.length; i++) {

		if (ctrlLinesArr[i][0] !== " ") {
			let ctrlOption = {};
			let line = ctrlLinesArr[i].replace(/^\s+|\s+$/g, '');
			let _ctrlOptionName = null;

			if (line.match(/^Simple mixer control (['A-Za-z,0-9]+)$/)) {
				_ctrlOptionName = line.match(/^Simple mixer control (['A-Za-z,0-9]+)$/)[1];
				_ctrlOptionName = _ctrlOptionName.replace(/\'/g, '').replace(/,/, '_');
				ctrlOption.name = _ctrlOptionName;
				ctrlOption.playbackChannels = [];
				controls[_ctrlOptionName] = ctrlOption;
			}

			for (j = i + 1; j < ctrlLinesArr.length; j++) {

				if (ctrlLinesArr[j][0] !== " ") {
					i = j;
					break;
				}

				let line = ctrlLinesArr[j].replace(/^\s+|\s+$/g, '');

				if (line.match (/^Playback channels:.*$/)) {
					let optionsMatch = line.match (/^Playback channels: ([a-z0-9A-Z_\- ]+)$/)[1];
					let optionPlaybackChannels = optionsMatch.split ('\-');
					optionPlaybackChannels.forEach ((channel) => {
						controls[_ctrlOptionName].playbackChannels.push(channel.replace(/^\s+|\s+$/g, ''));
					});
					continue;
				}

				let _playbackOptions = (controls[_ctrlOptionName]) ? controls[_ctrlOptionName].playbackChannels : [];
				if (_playbackOptions.length > 0)
					_playbackOptions.forEach ((option) => {
						_isOptionLine = (line.indexOf (option) < 0) ? false : true;
						if (_isOptionLine) {
							let _options = line.match (/\[(.*?)\]/g);
							if (_options &&  _options.length > 0 ) {
								controls[_ctrlOptionName][option] = {};
								controls[_ctrlOptionName][option]['volPercent'] = _options[0];
								controls[_ctrlOptionName][option]['isMuted'] = _options[_options.length - 1];
							}
						}
					});
			}
		}
	}
	return controls;
}

/*
 * Parse card number, device number and device name from the aplay output
 */
function parseAplayOut (stdout) {

	let deviceLinesArr = [], devices = [];
	let linesArr = stdout.split ('\n');

	/*
	 * Parse all lines with the card description from aplay output
	 */
	linesArr.forEach ((line) => {
		if (line.match (/^card [0-9]+:.*\[.*\], device [0-9]+:.*\[.*\]$/))
			deviceLinesArr.push (line);
	});


	/*
	 * Parse out card number and device number from card description lines
	 */
	deviceLinesArr.forEach ((line) => {
		let _card = line.match(/card (\d+):/)[1];
		let _device = line.match(/device (\d+):/)[1];
		let _name = line.match()
		devices.push ({cardNumber: _card, deviceNumber: _device});
	});

	return devices;
}
