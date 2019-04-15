const assert = require('assert');
const expect = require('chai').expect;
const should = require('chai').should();
const nac    = require ('..');

it('should return true if valid user id', function(){
	assert.equal(isValid, true);
	//expect(isValid).to.be.true;
});
it('should return false if invalid user id', function(){
	assert.equal(isValid, false);
	//	isValid.should.equal(false);
});

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
