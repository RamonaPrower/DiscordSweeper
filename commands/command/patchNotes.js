// imports
const strings = require('../../utils/strings.json');
// exports
module.exports = {
	async execute(message) {
		message.channel.send(strings.patchNotes, { split: true });
	},
};

module.exports.info = {
	name: 'Patch notes',
	description: 'patch notes',
	summon: 'patch notes',
};
module.exports.settings = {
	regexp: /(\bupdates\b|\bpatch notes\b)/mi,
	tag: 'patch notes',
};
