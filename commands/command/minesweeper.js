// imports
const MinesweeperBoard = require('../../utils/minesweeper/minesweeperBoard');
const minesweeperDiscord = require('../../utils/minesweeper/minesweeperDiscord');
// exports
module.exports = {
	execute(message) {
        let board;
        if (message.content.endsWith('easy')) {
            board = MinesweeperBoard.generate('easy');
        }
        else if (message.content.endsWith('hard')) {
            board = MinesweeperBoard.generate('hard');
        }
        else {
            board = MinesweeperBoard.generate();
        }
        const genMessage = minesweeperDiscord.parseToMessage(board);
        message.channel.send(genMessage);
	},
};

module.exports.info = {
	name: 'local minesweeper',
	description: 'locally generates a board',
	summon: '@ minesweeper',
};
module.exports.settings = {
	regexp: /\blocal\b/mi,
	tag: 'minesweeper',
};
