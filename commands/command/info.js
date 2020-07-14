// imports
const strings = require('../../utils/strings.json');
const { infoBoard } = require('../../models/infoStore');
// exports
module.exports = {
	async execute(message) {
		const wins = await infoBoard.getWins();
		const loss = await infoBoard.getLoss();
		message.channel.send(strings.info, { split: true });
		message.channel.send(`So far, there have been ${wins} wins and ${loss} losses globally`);
	},
};

module.exports.info = {
	name: 'info',
	description: 'info',
	summon: 'info',
};
module.exports.settings = {
	regexp: /(\bhelp\b|\binfo\b)/mi,
	tag: 'info',
};
