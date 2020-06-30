/* eslint-disable no-undef */
const io = require('socket.io-client');
window.$ = require('jquery');

let publicBoard;
let globalState;
const params = new URLSearchParams(document.location.search.substring(1));
const tag = params.get('h');
const socket = io('/sp');
$('#newBoardButton').click(() => {
    newBoard();
});

socket.emit('getBoard', tag, (board, state) => {
    publicBoard = board;
    globalState = state;
    if (state === 'inProgress') {
        generateGrid(board);
    }
    else if (state === 'failed') {
        blurGrid();
        generateGrid(board);
        disableClicks();
        console.log('failed board');
    }
    else {
        blurGrid();
        generateGrid(board);
        disableClicks();
    }
});

function generateGrid(board) {
    grid.innerHTML = '';
    for (let i = 0; i < board.length; i++) {
        const row = grid.insertRow(i);
        for (let j = 0; j < board[i].length; j++) {
            const cell = row.insertCell(j);
            if (board[i][j].revealed === true && board[i][j].mine === false) {
                cell.innerHTML = board[i][j].minecount;
                cell.className = 'clicked';
            }
            else if (board[i][j].revealed === true && board[i][j].mine === true) {
                cell.className = 'mine';
            }
            else if (board[i][j].revealed === false && board[i][j].flagged === true) {
                cell.innerHTML = '🚩';
                cell.className = 'flag';
            }
        }
    }
    enableClicks();
}
function updateGrid(board) {
    const grid = document.getElementById('grid');
    for (let i = 0; i < board.length; i++) {
        const row = grid.rows[i];
        for (let j = 0; j < board[i].length; j++) {
            const cell = row.cells[j];
            if (board[i][j].revealed === true && board[i][j].mine === false) {
                if (cell.className == '') {
                    cell.className = 'half';
                    setTimeout(() => {
                        cell.innerHTML = board[i][j].minecount;
                        cell.className = 'clicked';
                    }, 65);
                }
                else {
                    cell.innerHTML = board[i][j].minecount;
                        cell.className = 'clicked';
                }
            }
            else if (board[i][j].revealed === true && board[i][j].mine === true) {
                cell.className = 'mine';
            }
            else if (board[i][j].revealed === false && board[i][j].flagged === true) {
                cell.innerHTML = '🚩';
                cell.className = 'flag';
            }
            else{
                cell.innerHTML = '';
                cell.className = '';

            }
        }
    }
    enableClicks();
}
function enableClicks() {
    $('#grid:has(td)').mouseup(function(event) {
        const clickedCell = $(event.target).closest('td');

        if (clickedCell[0].innerHTML == '' || clickedCell[0].innerHTML == '🚩') {
            switch (event.which) {
                case 1:
                    // left
                    clickCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    break;
                case 3:
                    // right
                    flagCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    break;
                default:
                    // anything else
                    break;
            }
        }

    });
    $('#grid:has(td)').bind('contextmenu', function(e) {
        return false;
    });
}
function disableClicks() {
    $('#grid:has(td)').off('mouseup');
}
function clickCell(x, y) {
    disableClicks();
    socket.emit('boardClick', x, y, tag, (board, state) => {
        globalState = state;
        if (state === 'inProgress') {
            // generateGrid(board);
            updateGrid(board);
        }
        else if (state === 'failed') {
            blurGrid();
            generateGrid(board);
            disableClicks();
            console.log('failed board');
        }
        else {
            blurGrid();
            generateGrid(board);
            disableClicks();
        }
    });
}
function flagCell(x, y) {
    console.log(x, y);
    disableClicks();
    socket.emit('flagClick', x, y, tag, (board, state) => {
        // generateGrid(board);
        updateGrid(board);
    });
}
function newBoard() {
    disableClicks();
    socket.emit('newBoard', tag, globalState, (board) => {
        unblurGrid();
        generateGrid(board);
    });
}
function blurGrid() {
    $('#grid:has(td)').css({ 'filter': 'blur(5px)' });

}
function unblurGrid() {
    $('#grid:has(td)').css({ 'filter': 'blur(0px)' });
}