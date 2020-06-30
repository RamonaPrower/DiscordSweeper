/* eslint-disable no-undef */
const io = require('socket.io-client');
window.$ = require('jquery');
const { Howl, Howler } = require('howler');

const { confetti } = require('dom-confetti');

// setup

const config = {
    angle: '90',
    spread: '181',
    startVelocity: '61',
    elementCount: '200',
    dragFriction: '0.27',
    duration: '3950',
    stagger: '3',
    width: '20px',
    height: '20px',
    perspective: '0px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

const flip = new Howl({
    src: ['/sounds/click.wav'],
    volume: 0.3,
});

const boom = new Howl({
    src: ['/sounds/boom.wav'],
    volume: 0.2,
});

const bell = new Howl({
    src: ['/sounds/flag.wav'],
    volume: 0.3,
});

const victory = new Howl({
    src: ['/sounds/victory.mp3'],
    volume: 0.3,
});

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
    let flips = 0;
    for (let i = 0; i < board.length; i++) {
        const row = grid.rows[i];
        for (let j = 0; j < board[i].length; j++) {
            const cell = row.cells[j];
            if (board[i][j].revealed === true && board[i][j].mine === false) {
                if (cell.className == '') {
                    flips++;
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
                if (cell.className == '') {
                    cell.className = 'half';
                    setTimeout(() => {
                        cell.className = 'mine';
                    }, 65);
                }
                else {
                    cell.className = 'mine';
                }

            }
            else if (board[i][j].revealed === false && board[i][j].flagged === true) {
                if (cell.className == '') {

                    flip.play();
                    setTimeout(() => {
                        bell.play();
                    }, 100);
                    cell.className = 'half';
                    setTimeout(() => {
                        cell.innerHTML = '🚩';
                        cell.className = 'flag';
                    }, 65);
                }
                else {
                    cell.innerHTML = '🚩';
                    cell.className = 'flag';
                }

            }
            else {
                cell.innerHTML = '';
                cell.className = '';

            }
        }
    }
    if (flips > 0) {
        if (flips > 3) { flips = 3; }
        (function flipLoop(i) {
            setTimeout(function() {
                flip.play();
                if (--i) flipLoop(i);
            }, 45);
        })(flips);
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
    $('#grid:has(td)').css;
}
function clickCell(x, y) {
    disableClicks();
    socket.emit('boardClick', x, y, tag, (board, state) => {
        globalState = state;
        if (state === 'inProgress') {
            updateGrid(board);
        }
        else if (state === 'failed') {
            boom.play();
            generateGrid(board);
            disableClicks();
            blurGrid();
        }
        else {
            generateGrid(board);
            const container = document.getElementById('confetti');
            confetti(container, config);
            victory.play();
            disableClicks();
            blurGrid();
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
    $('#grid:has(td)').css({ 'filter': 'blur(5px)', 'transition': 'all 0.3s ease-in' });

}
function unblurGrid() {
    $('#grid:has(td)').css({ 'filter': 'blur(0px)', 'transition': 'all 0.3s ease-in' });
}