const { parseFromWebToMessage } = require('../minesweeper/minesweeperDiscord');

module.exports = {
    sp: {
        updateBoard(message, board, user, state) {
            const result = parseFromWebToMessage(board);
            if (state === 'complete') {result.push(`${user} has won!`);}
            else if (state === 'failed') {result.push(`${user} has failed!`);}
            else {result.push(`board generated for ${user}`);}
            message.edit(result);
        },
    },
};