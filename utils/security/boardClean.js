module.exports = {
    cleanToWeb(board) {
        const newBoard = board;
        for (let i = 0; i < newBoard.length; i++) {
            for (let j = 0; j < newBoard[i].length; j++) {
                if (newBoard[i][j].revealed === false && newBoard[i][j].flagged === false) {
                    newBoard[i][j] = {
                        revealed: false,
                    };
                }
                else if (newBoard[i][j].revealed === false && newBoard[i][j].flagged === true) {
                    newBoard[i][j] = {
                        revealed: false,
                        flagged: true,
                    };
                }

            }
        }
        return newBoard;
    },
};