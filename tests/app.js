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
//test1();
test2();
