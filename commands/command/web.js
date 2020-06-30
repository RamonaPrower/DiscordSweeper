// imports

const MinesweeperBoard = require('../../utils/minesweeper/minesweeperBoard');
const { nanoid } = require('nanoid');
const minesweeperDiscord = require('../../utils/minesweeper/minesweeperDiscord');
const storageHandler = require('../../utils/storage/storageHandler');

// exports
module.exports = {
	async execute(message) {
        let board;
        let difficulty;
        let mines;
        if (message.content.endsWith('medium')) {
            board = MinesweeperBoard.generate('medium');
            difficulty = 'medium';
            mines = 10;
        }
        else {
            board = MinesweeperBoard.generate();
            difficulty = 'easy';
            mines = 4;
        }
        const genCode = nanoid(14);
        if (process.env.NODE_ENV !== 'production') {
            await message.channel.send(`random link is http://localhost:3000/mine?h=${genCode}`);
        }
        else {
            try {
                await message.author.send(`random link is https://${process.env.SERVER_URL}/mine?h=${genCode}`);
            }
 catch (error) {
                await message.channel.send('i need to be able to send you a DM for the link');
            }

        }
        const toSendMessage = minesweeperDiscord.parseFromWebToMessage(board);
        toSendMessage.push(`board generated for ${message.member.displayName}`);
        const sentMessage = await message.channel.send(toSendMessage);
        const store = {
            messageLink: sentMessage.url,
            board,
            mines,
            user: message.member.displayName,
            state: 'inProgress',
            difficulty,
            wins: 0,
            loss: 0,
        };
        storageHandler.set(genCode, store);
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
