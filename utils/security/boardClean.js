module.exports = {
    cleanToWeb(board) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].revealed === false) {
                    board[i][j] = {
                        revealed: false,
                    };
                }

            }
        }
        return board;
    },
};