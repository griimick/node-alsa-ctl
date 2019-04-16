const nac = require ('..');

async function test1 () {
	let devices = await nac.getDevices ();
	let cards = await nac.getSoundcards ();
	console.log (devices);
	console.log (cards);
}

async function test2 () {
	let controls = await nac.getControls (0);
	console.log (controls);
}

async function test3 () {
	let controls = await nac.getControls (0, 27);
	console.log (controls);
}

async function test4 () {
	let controls = await nac.getControls (0, 27);
	console.log (controls);
}

async function test5 () {
	query = { numid: '27',
    iface: 'MIXER',
    name: 'Master Playback Switch',
    type: 'BOOLEAN',
    access: 'rw------',
    valuesCount: '1',
    values: [ 'on' ] };
	let controls = await nac.setControl (0, query);
	console.log (controls);
}
async function test6 () {
	query = { numid: '27',
    iface: 'MIXER',
    name: 'Master Playback Switch',
    type: 'BOOLEAN',
    access: 'rw------',
    valuesCount: '1',
    values: [ 'off' ] };
	let controls = await nac.setControl (0, query);
	console.log (controls);
}

async function test7 () {
	query = { numid: '27',
    iface: 'MIXER',
    name: 'Master Playback Switch',
    type: 'BOOLEAN',
    access: 'rw------',
    valuesCount: '1',
    values: [ 'off' ] };
	let controls = await nac.setControl (0, query);
	console.log (controls);
}

async function test8 () {
	query =	{ numid: '26',
    iface: 'MIXER',
    name: 'Master Playback Volume',
    type: 'INTEGER',
    access: 'rw---R--',
    valuesCount: '1',
    min: '0',
    max: '127',
    step: '0',
    values: [ '127' ] };
	let controls = await nac.setControl (0, query);
	console.log (controls);
}

async function test9 () {
	query =	{ numid: '26',
    iface: 'MIXER',
    name: 'Master Playback Volume',
    type: 'INTEGER',
    access: 'rw---R--',
    valuesCount: '1',
    min: '0',
    max: '127',
    step: '0',
    values: [ '10' ] };
	let controls = await nac.setControl (0, query);
	console.log (controls);
}

async function test10 () {
	query =	[{ numid: '26',
    iface: 'MIXER',
    name: 'Master Playback Volume',
    type: 'INTEGER',
    access: 'rw---R--',
    valuesCount: '1',
    min: '0',
    max: '127',
    step: '0',
    values: [ '100' ] },
	{ numid: '27',
    iface: 'MIXER',
    name: 'Master Playback Switch',
    type: 'BOOLEAN',
    access: 'rw------',
    valuesCount: '1',
    values: [ 'off' ] }];
	let controls = await nac.setControls (0, query);
	console.log (controls);
}
//test1();
//test2();
//test3();
//test4();
//test6();
//test5();
//test7();
//test8();
//test9();
test10();
