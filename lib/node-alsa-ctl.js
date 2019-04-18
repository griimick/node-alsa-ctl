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

exports.getDevices    = getDevices;
exports.getSoundcards = getSoundcards;
exports.getControls   = getControls;
exports.setControl    = setControl;
exports.setControls   = setControls;

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

	devicesList = devicesRawList;

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

	soundcardsList = soundcardsRawList;

	return soundcardsList;
}

/*
 * Parse Amixer contents output
 */
async function getControls (cardNumber, query) {

	if (query !== undefined && typeof query !== 'number' && typeof query !== 'string' && query !== null)
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

	let { stdout, strerr } = await exec (amixerCommand);

	controls = amixerParser (stdout);

	return controls;
}

/*
 * Set single control
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

	if (query.numid)
		amixerCommand = `amixer -c  ${cardNumber} cset numid=${query.numid} ${values}` ;
	else if (query.name)
		amixerCommand = `amixer -c  ${cardNumber} cset name='${query.name}' ${values}` ;
	else
		throw Error ('Missing numid and name for control')

	let { stdout, strerr } = await exec (amixerCommand);

	controls = amixerParser (stdout);

	return controls;
}

/*
 * Set list of controls
 */
async function setControls (cardNumber, queries) {

	let controls = [];

	if (!Array.isArray(queries))
		throw Error ('Query should be an array of queries')

	for (let i = 0; i < queries.length; i++) {
		let control = await setControl (cardNumber, queries[i]);
		controls.push (...control);
	}

	return controls;
}
