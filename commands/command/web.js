// imports

const MinesweeperBoard = require('../../utils/minesweeper/minesweeperBoard');
const { nanoid } = require('nanoid');
const qdCache = require('qdcache');
const minesweeperDiscord = require('../../utils/minesweeper/minesweeperDiscord');

// exports
module.exports = {
	async execute(message) {
        let board;
        if (message.content.endsWith('medium')) {
            board = MinesweeperBoard.generate('medium');
        }
        else {
            board = MinesweeperBoard.generate();
        }
        const genCode = nanoid(14);
        await message.channel.send(`random link is http://discordsweeper-test.herokuapp.com//mine?h=${genCode}`);
        const toSendMessage = minesweeperDiscord.parseFromWebToMessage(board);
        toSendMessage.push(`board generated for ${message.member.displayName}`);
        const sentMessage = await message.channel.send(toSendMessage);
        const store = {
            messageLink: sentMessage.url,
            board,
            user: message.member.displayName,
        };
        qdCache.set(genCode, store);
	},
};

module.exports.info = {
	name: 'Test',
	description: 'Test',
	summon: 'Test',
};
module.exports.settings = {
	regexp: /web/mi,
	tag: 'test',
};
