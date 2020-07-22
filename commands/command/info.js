// imports
const strings = require('../../utils/strings.json');
// exports
module.exports = {
	async execute(message) {
		message.channel.send(strings.info, { split: true });
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
