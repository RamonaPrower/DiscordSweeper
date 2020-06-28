module.exports = {
    generate(difficulty) {
        let row = 5;
        let col = 5;
        let mines = 4;
        if (difficulty === 'medium') {
            col = 10;
            row = 10;
            mines = 10;
        }
        // generate board
        const board = [...Array(row)].map(() => Array(col));
        // populate with basics
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                board[i][j] = {
                    mine: false,
                    minecount: 0,
                    revealed: false,
                    flagged: false,
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
                board[mineRow][mineCol].mine = true;
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
    },
    clickCell(board, inputRow, inputCol) {
        let toClick = [];
        function actuallyClickCell(row, col) {
            board[row][col].revealed = true;
            if (board[row][col].minecount == 0) {
                for (let newRow = Math.max(row - 1, 0); newRow <= Math.min(row + 1, board.length - 1); newRow++) {
                    for (let newCol = Math.max(col - 1, 0); newCol <= Math.min(col + 1, board.length - 1); newCol++) {
                        if (board[newRow][newCol].revealed === false) {
                            toClick.push([newRow, newCol]);
                        }
                    }
                }
            }
        }
        actuallyClickCell(inputRow, inputCol);
        while (toClick.length >= 1) {
            // removes dupes
            toClick = Array.from(new Set(toClick.map(JSON.stringify)), JSON.parse);
            const newCell = toClick.shift();
            if (board[newCell[0]][newCell[1]].revealed === false) {
                actuallyClickCell(newCell[0], newCell[1]);
            }
        }
        function revealMines() {
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if(board[i][j].mine === true && board[i][j].revealed === false) {
                        board[i][j].revealed = true;
                    }
                }
            }
        }
        let levelComplete = true;
        let levelFailed = false;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if(board[i][j].mine === false && board[i][j].revealed === false) {
                    levelComplete = false;
                }
                if(board[i][j].mine === true && board[i][j].revealed === true) {
                    levelComplete = false;
                    levelFailed = true;
                    revealMines();
                }
            }
        }
        if (levelComplete == true) {
            const state = 'complete';
            revealMines();
            return { board, state };
        }
        else if (levelFailed == true) {
            const state = 'failed';
            return { board, state };
        }
        else {
            const state = 'inProgress';
            return { board, state };
        }
    },
    flagCell(board, inputRow, inputCol) {
        if (board[inputRow][inputCol].flagged === true) {
            board[inputRow][inputCol].flagged = false;
        }
        else{
            board[inputRow][inputCol].flagged = true;
        }
        function revealMines() {
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if(board[i][j].mine === true && board[i][j].revealed === false) {
                        board[i][j].revealed = true;
                    }
                }
            }
        }
        let levelComplete = true;
        let levelFailed = false;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if(board[i][j].mine === false && board[i][j].revealed === false) {
                    levelComplete = false;
                }
                if(board[i][j].mine === true && board[i][j].revealed === true) {
                    levelComplete = false;
                    levelFailed = true;
                    revealMines();
                }
            }
        }
        if (levelComplete == true) {
            const state = 'complete';
            revealMines();
            return { board, state };
        }
        else if (levelFailed == true) {
            const state = 'failed';
            return { board, state };
        }
        else {
            const state = 'inProgress';
            return { board, state };
        }
    },
};