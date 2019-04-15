const nac = require ('..');

async function main () {
	let out = await nac.getAmixer (0);
	console.log (out);
}

main();
