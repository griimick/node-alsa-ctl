const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

async function getGitUser () {
	const name = await exec('git config --global user.name')
	const email = await exec('git config --global user.email')
	return { name, email }
};

module.exports.getGitUser = getGitUser;
