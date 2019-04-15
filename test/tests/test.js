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
	let controls = await nac.getControls (0, 'Master Playback Switch');
	console.log (controls);
}
//test1();
//test2();
//test3();
//test4();
