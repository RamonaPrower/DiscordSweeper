const { parseFromWebToMessage } = require('../minesweeper/minesweeperDiscord');

const queue = new Map();


setInterval(async function() {
    const next = queue.entries().next();
    if (next.value === undefined) {
        return;
    }
    messageUpdate(next.value[1].messageObj, next.value[1].res);
    queue.delete(next.value[0]);
}, 1000);

async function messageUpdate(message, res) {
    const result = parseFromWebToMessage(res.board);
    if (res.state === 'complete') { result.push(`${res.user} has won!`); }
    else if (res.state === 'failed') { result.push(`${res.user} has failed!`); }
    else { result.push(`board generated for ${res.user}`); }
    if (res.loss > 0) {
        result.push(`${res.user} has lost ${res.loss} games`);
    }
    if (res.wins > 0) {
        result.push(`${res.user} has won ${res.wins} games`);
    }
    message.edit(result);
}

module.exports = {
    sp: {
        updateBoard(messageObj, res) {
            const buf = {
                res,
                messageObj,
            };
            queue.set(res.messageLink, buf);
        },
    },
};