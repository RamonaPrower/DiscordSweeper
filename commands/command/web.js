// imports

const MinesweeperBoard = require('../../utils/minesweeper/minesweeperBoard');
const { nanoid } = require('nanoid');
const minesweeperDiscord = require('../../utils/minesweeper/minesweeperDiscord');
const storageHandler = require('../../utils/storage/storageHandler');
const difficulties = require('../../utils/difficulties.json');

// exports
module.exports = {
	async execute(message) {
        let board;
        let difficulty;
        let mines;
        if (message.content.endsWith('easy') || message.content.endsWith('small')) {
            board = MinesweeperBoard.generate('easy');
            difficulty = 'easy';
            mines = difficulties.easy.mines;
        }
        else if (message.content.endsWith('hard') || message.content.endsWith('large')) {
            board = MinesweeperBoard.generate('hard');
            difficulty = 'hard';
            mines = difficulties.hard.mines;
        }
        else {
            board = MinesweeperBoard.generate();
            difficulty = 'medium';
            mines = difficulties.medium.mines;
        }
        const genCode = nanoid(14);
        if (process.env.NODE_ENV !== 'production') {
            await message.channel.send(`random link is http://localhost:3000/mine?h=${genCode}`);
        }
        else {
            try {
                await message.author.send(`link to the web is https://${process.env.SERVER_URL}/mine?h=${genCode}`);
            }
 catch (error) {
                await message.channel.send('i need to be able to send you a DM for the link');
                return;
            }

        }
        const toSendMessage = minesweeperDiscord.parseFromWebToMessage(board);

        let sentMessage;
        if (message.channel.type === 'dm') {
            toSendMessage.push(`board generated for ${message.author.username}`);
            sentMessage = await message.author.send(toSendMessage);
            const store = {
                messageLink: sentMessage.url,
                board,
                mines,
                user: message.author.username,
                state: 'inProgress',
                difficulty,
                wins: 0,
                loss: 0,
                time: 0,
            };
            await storageHandler.set(genCode, store);
        }
        else {
            toSendMessage.push(`board generated for ${message.member.displayName}`);
            sentMessage = await message.channel.send(toSendMessage);
            const store = {
                messageLink: sentMessage.url,
                board,
                mines,
                user: message.member.displayName,
                state: 'inProgress',
                difficulty,
                wins: 0,
                loss: 0,
                time: 0,
            };
            await storageHandler.set(genCode, store);
        }

	},
};

module.exports.info = {
	name: 'Web',
	description: 'Test',
	summon: 'web',
};
module.exports.settings = {
	regexp: /\bweb\b/mi,
	tag: 'web',
};
