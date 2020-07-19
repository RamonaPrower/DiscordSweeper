// imports
const strings = require('../../utils/strings.json');
const { infoBoard } = require('../../models/infoStore');
// exports
module.exports = {
	async execute(message) {
        const data = [];
		const wins = await infoBoard.getWins();
        const loss = await infoBoard.getLoss();
        data.push(`So far, there have been ${wins} wins and ${loss} losses globally`);
        data.push(`i'm in ${message.client.guilds.cache.size} servers`);
		message.channel.send(data, { split: true });
	},
};

module.exports.info = {
	name: 'stats',
	description: 'stats',
	summon: 'stats',
};
module.exports.settings = {
	regexp: /\bstats\b/mi,
	tag: 'stats',
};
