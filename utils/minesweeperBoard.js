class MinesweeperBoard {
    static generate(difficulty) {
        let row = 5;
        let col = 5;
        let mines = 7;
        if (difficulty === 'medium') {
            col = 10;
            row = 10;
            mines = 20;
        }
        // generate board
        const board = [...Array(row)].map(() => Array(col));
        // populate with basics
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                board[i][j] = {
                    mine: false,
                    minecount: 0,
                };
            }
        }
        // generate mines
        for (let i = 0; i < mines; i++) {
            const mineRow = Math.floor(Math.random() * row);
            const mineCol = Math.floor(Math.random() * col);
            const genCell = board[mineRow][mineCol];
            if (genCell.mine === true) {
                i--;
            }
            else {
                board[mineRow][mineCol] = {
                    mine: true,
                };
            }
        }
        // calculate how many mines around non-mines
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let minecount = 0;
                // for each cell get rows around it
                for (let k = Math.max(i - 1, 0); k <= Math.min(i + 1, board.length - 1); k++) {
                    // get colums around it
                    for (let l = Math.max(j - 1, 0); l <= Math.min(j + 1, board[i].length - 1); l++) {
                        if (board[k][l].mine === true) { minecount++; }
                    }
                }
                board[i][j].minecount = minecount;
            }
        }
        return board;
    }
}

module.exports = MinesweeperBoard;