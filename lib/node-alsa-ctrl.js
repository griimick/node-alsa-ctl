const { promisify } = require('util');
const exec = promisify (require ('child_process').exec);
const { aplayParser, amixerParser } = require ('./parser');

/*
 * Initialize temporary cache list as null for first init
 */
let devicesList = null;
let soundcardsList = null;

exports = module.exports = {};
exports.getDevices = getDevices;
exports.getSoundcards = getSoundcards;
exports.getControls = getControls;

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
 * soundDevice strucutre with getter functions
 */
function soundCard (card) {
	this._raw = card;
	this.getCardNumber = () => card.cardNumber;
	this.getName = () => card.name;
}

/*
 * Get only sound devices from "aplay -l"
 */
async function getDevices (force) {

	if (!force && devicesList !== null)
		return devicesList;

	devicesList = [];

	let { stdout, strerr } = await exec ('aplay -l');
	let stdoutParsed = aplayParser (stdout);

	devicesRawList = stdoutParsed.devices;

	devicesRawList.forEach ((device) => {
		devicesList.push (new soundDevice (device));
	});

	devicesList._raw = devicesRawList;

	return devicesList;
}

/*
 * Get only sound cards from "aplay -l"
 */
async function getSoundcards (force) {

	if (!force && soundcardsList !== null)
		return soundcardsList;

	soundcardsList = [];

	let { stdout, strerr } = await exec ('aplay -l');
	let stdoutParsed = aplayParser (stdout);

	soundcardsRawList = stdoutParsed.soundcards;

	soundcardsRawList.forEach ((card) => {
		soundcardsList.push (new soundCard (card));
	});

	soundcardsList._raw = devicesRawList;

	return soundcardsList;
}

/*
 * Parse Amixer contents output
 */
async function getControls (cardNumber, query = null) {

	let amixerCommand;

	switch (typeof query) {
		case 'number':
			amixerCommand = 'amixer -c ' + cardNumber + ' cget numid=' + query;
			break;
		case 'string':
			amixerCommand = 'amixer -c ' + cardNumber + ' cget name=\'' + query + '\'';
			break;
		default:
			amixerCommand = 'amixer -c ' + cardNumber + ' contents';
	}


	let { stdout, strerr } = await exec (amixerCommand);

	controls = amixerParser (stdout);

	return controls;
}
