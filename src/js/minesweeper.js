/* eslint-disable no-undef */
const io = require('socket.io-client');
window.$ = require('jquery');

let publicBoard;
const params = new URLSearchParams(document.location.search.substring(1));
const tag = params.get('h');
const socket = io('/sp');
socket.emit('getBoard', tag, (board) => {
    publicBoard = board;
    generateGrid(board);
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
        if (state === 'inProgress') {
            // generateGrid(board);
            updateGrid(board);
        }
        else {
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