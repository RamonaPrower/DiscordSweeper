// imports
const strings = require('../../utils/strings.json');
// exports
module.exports = {
	execute(message) {
        message.channel.send(strings.info, { split: true });
	},
};

module.exports.info = {
	name: 'info',
	description: 'info',
	summon: 'info',
};
module.exports.settings = {
	regexp: /\binfo\b/mi,
	tag: 'info',
};
