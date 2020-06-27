const { parseFromWebToMessage } = require('../minesweeper/minesweeperDiscord');

module.exports = {
    sp: {
        updateBoard(message, board, user) {
            const result = parseFromWebToMessage(board);
            result.push(`board generated for ${user}`);
            message.edit(result);
        },
    },
};