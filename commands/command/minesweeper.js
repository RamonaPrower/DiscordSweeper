// imports
const MinesweeperBoard = require('../../utils/minesweeperBoard');
const minesweeperDiscord = require('../../utils/minesweeperDiscord');
// exports
module.exports = {
	execute(message) {
        let board;
        if (message.content.endsWith('medium')) {
            board = MinesweeperBoard.generate('medium');
        }
        else {
            board = MinesweeperBoard.generate();
        }
        const genMessage = minesweeperDiscord.parseToMessage(board);
        message.channel.send(genMessage);
	},
};

module.exports.info = {
	name: 'minesweeper',
	description: 'minesweeper generator code',
	summon: '@ minesweeper',
};
module.exports.settings = {
	regexp: /mine/mi,
	tag: 'minesweeper',
};
