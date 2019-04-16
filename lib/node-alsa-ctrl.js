const { promisify } = require('util');
const exec = promisify (require ('child_process').exec);
const { aplayParser, amixerParser } = require ('./parser');
const { queryValuesParser } = require ('./parser-utils');

/*
 * Initialize temporary cache list as null for first init
 */
let devicesList = null;
let soundcardsList = null;

exports = module.exports = {};
exports.getDevices = getDevices;
exports.getSoundcards = getSoundcards;
exports.getControls = getControls;
exports.setControl = setControl;

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

	soundcardsList._raw = soundcardsRawList;

	return soundcardsList;
}

/*
 * Parse Amixer contents output
 */
async function getControls (cardNumber, query) {

	if (query === undefined && (typeof query !== 'number' || typeof query !== 'string'))
		throw TypeError ("Query must be a number [numid] or a string [name].")

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

	console.log (`=============${amixerCommand}==================`);
	let { stdout, strerr } = await exec (amixerCommand);

	controls = amixerParser (stdout);

	return controls;
}

/*
 * Parse Amixer contents output
 */
async function setControl (cardNumber, query) {

	/*
	 * TODO: Validate queryObj */
	let amixerCommand, values;

	if (!query || typeof query !== 'object')
		throw Error ('Invalid query');

	if (!query.values)
		throw Error ('Invalid values');

	values = queryValuesParser (query.values);

	if (query.numid && typeof query.numid === 'number')
		amixerCommand = `amixer -c  ${cardNumber} cset numid=${query.numid} ${values}` ;
	else if (query.name && typeof query.name === 'string')
		amixerCommand = `amixer -c  ${cardNumber} cset name='${query.name}' ${values}` ;
	else
		throw Error ('Missing numid and name for control')

	console.log (`=============${amixerCommand}==================`);
	let { stdout, strerr } = await exec (amixerCommand);

	controls = amixerParser (stdout);

	return controls;
}
