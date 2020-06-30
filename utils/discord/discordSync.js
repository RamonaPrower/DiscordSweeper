const { parseFromWebToMessage } = require('../minesweeper/minesweeperDiscord');

module.exports = {
    sp: {
        updateBoard(message, res) {
            const result = parseFromWebToMessage(res.board);
            if (res.state === 'complete') {result.push(`${res.user} has won!`);}
            else if (res.state === 'failed') {result.push(`${res.user} has failed!`);}
            else {result.push(`board generated for ${res.user}`);}
            if (res.loss > 0) {
                result.push(`${res.user} has lost ${res.loss} games`);
            }
            if (res.wins > 0) {
                result.push(`${res.user} has won ${res.wins} games`);
            }
            message.edit(result);
        },
    },
};