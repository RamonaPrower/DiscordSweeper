const difficulties = require('../difficulties.json');

module.exports = {
    generate(inputDifficulty) {
        const difficulty = inputDifficulty ? inputDifficulty : 'medium';
        let row = difficulties.medium.rows;
        let col = difficulties.medium.col;
        let mines = difficulties.medium.mines;
        if (difficulty === 'easy') {
            col = difficulties.easy.col;
            row = difficulties.easy.rows;
            mines = difficulties.easy.mines;
        }
        if (difficulty === 'hard') {
            col = difficulties.hard.col;
            row = difficulties.hard.rows;
            mines = difficulties.hard.mines;
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
                    question: false,
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
        // click cell function
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
                    if (board[i][j].mine === true && board[i][j].revealed === false) {
                        board[i][j].revealed = true;
                    }
                }
            }
        }
        let levelComplete = true;
        let levelFailed = false;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].mine === false && board[i][j].revealed === false) {
                    levelComplete = false;
                }
                if (board[i][j].mine === true && board[i][j].revealed === true) {
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
        else {
            board[inputRow][inputCol].flagged = true;
        }
            const state = 'inProgress';
            return { board, state };
    },
    questionCell(board, inputRow, inputCol) {
        if (board[inputRow][inputCol].flagged === true && board[inputRow][inputCol].question === false) {
            board[inputRow][inputCol].flagged = false;
            board[inputRow][inputCol].question = true;
        }
        else {
            board[inputRow][inputCol].question = false;
        }
        const state = 'inProgress';
        return { board, state };
    },
    clickCellSafely(oldBoard, inputRow, inputCol, difficulty) {
        let firstClicked = true;
        const safeBoard = false;
        for (const row of oldBoard) {
            for (const cell of row) {
                if (cell.revealed === true) {
                    firstClicked = false;
                }
            }
        }
        if (firstClicked === false) {
            const { board, state } = this.clickCell(oldBoard, inputRow, inputCol);
            return { board, state };
        }
        while (safeBoard === false) {
            const { board, state } = this.clickCell(oldBoard, inputRow, inputCol);
            if (state === 'inProgress') {
                return { board, state };
            }
            else {
                oldBoard = this.generate(difficulty);
            }
        }
    },
    chordCell(board, inputRow, inputCol) {
        let flagCount = 0;
        const hiddenCells = [];
        let valid = false;
        const rootCell = board[inputRow][inputCol];
        if (board[inputRow][inputCol].revealed === true && board[inputRow][inputCol].minecount > 0) {
            for (let newRow = Math.max(inputRow - 1, 0); newRow <= Math.min(inputRow + 1, board.length - 1); newRow++) {
                for (let newCol = Math.max(inputCol - 1, 0); newCol <= Math.min(inputCol + 1, board.length - 1); newCol++) {
                    const newCell = board[newRow][newCol];
                    if (newCell.revealed === false && newCell.flagged === false) {
                        hiddenCells.push([newRow, newCol]);
                    }
                    else if (newCell.revealed === false && newCell.flagged === true) {
                        flagCount++;
                    }
                }
            }
        }
        if (hiddenCells.length === 0) {
            const state = 'inProgress';
            return { board, state, valid };
        }
        if (rootCell.minecount === flagCount && rootCell.minecount !== 0 && hiddenCells.length !== 0) {
            // valid chord
            valid = true;
            let tempboard = board;
            let tempState;
            for (const arr of hiddenCells) {
                const { board: temptempboard, state } = this.clickCell(tempboard, arr[0], arr[1]);
                tempboard = temptempboard;
                tempState = state;
                if (tempState !== 'inProgress') {
                    return { tempboard, tempState, valid };
                }
            }
            return { tempboard, tempState, valid };
        }
        else {
            const state = 'inProgress';
            return { board, state, valid };
        }
    },
};