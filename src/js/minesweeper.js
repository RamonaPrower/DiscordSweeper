/* eslint-disable no-undef */
const io = require('socket.io-client');
window.$ = require('jquery');
const { confetti } = require('dom-confetti');
const { DuckTimer } = require('duck-timer');
const { flip, bell, boom, victory, error, question } = require('./sounds');
const timer = new DuckTimer({ interval: 1000 });

// setup

const config = {
    angle: '90',
    spread: '181',
    startVelocity: '61',
    elementCount: '50',
    dragFriction: '0.27',
    duration: '6000',
    stagger: '3',
    width: '20px',
    height: '20px',
    perspective: '0px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
};

let publicBoard;
let globalState;
let flagCounter;
const params = new URLSearchParams(document.location.search.substring(1));
const tag = params.get('h');
const socket = io(`/sp?tag=${tag}`);
$('#newBoardButton').click(() => {
    newBoard();
});

setInterval(function() {
    socket.emit('keepAlive');
}, 5000);

socket.emit('getBoard', (board, state, mines) => {
    publicBoard = board;
    globalState = state;
    initialMines(mines);
    if (state === 'inProgress') {
        generateGrid(board);
    }
    else if (state === 'failed') {
        generateGrid(board);
        blurGrid();
        timer.stop();
        disableClicks();
        showFailStatus();
    }
    else {
        generateGrid(board);
        blurGrid();
        disableClicks();
        timer.stop();
        showWinStatus();
    }
});

function generateGrid(board) {
    timer.reset();
    clearStatus();
    grid.innerHTML = '';
    flagCounter = 0;
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
                flagCounter++;
                cell.innerHTML = '🚩';
                cell.className = 'flag';
            }
            else if (board[i][j].revealed === false && board[i][j].question === true) {
                cell.innerHTML = '❓';
                cell.className = 'question';
            }
        }
    }
    timer.onInterval(res => {
        let minCount = 0;
        if (res.minutes > 0) {
            minCount = res.minutes;
        }
        let calcSecs = res.seconds - (minCount * 60);
        if (calcSecs < 10) calcSecs = '0' + calcSecs;
        const str = `Timer: ${minCount}:${calcSecs}`;
        $('#timer').text(str);
    }).start();
    enableClicks();
    updateFlagCounter();
}
function updateGrid(board) {
    const grid = document.getElementById('grid');
    let flips = 0;
    flagCounter = 0;
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
                flagCounter++;
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
            else if (board[i][j].revealed === false && board[i][j].question === true) {
                if (cell.className == 'flag') {
                    question.play();
                    cell.className = 'half';
                    setTimeout(() => {
                        cell.innerHTML = '❓';
                        cell.className = 'question';
                    }, 65);
                }
                else {
                    cell.innerHTML = '❓';
                    cell.className = 'question';
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
    updateFlagCounter();
}
let leftButton = false;
let rightButton = false;
function enableClicks() {


    $('#grid:has(td)').mouseup(function(event) {
        const clickedCell = $(event.target).closest('td');
        // errors flood the console if the user clicks *just* outside of a cell
        // this stops that (hopefully);
        if (clickedCell.length === 0) return;
        if (clickedCell[0].innerHTML == '') {
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
        // if cell is flagged
        else if (clickedCell[0].innerHTML == '🚩') {
            switch (event.which) {
                case 3:
                    // right
                    questionCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    break;
                default:
                    // anything else
                    break;
            }
        }
        else if (clickedCell[0].innerHTML == '❓') {
            switch (event.which) {
                case 3:
                    questionCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
            }
        }
        if (clickedCell[0].className == 'clicked') {
            switch (event.which) {
                case 1:
                    // left
                    leftButton = false;
                    break;
                case 3:
                    // right
                    rightButton = false;
                    break;
                default:
                    // anything else
                    break;
            }
        }
    });
    $('#grid:has(td)').mousedown(function(event) {
        const clickedCell = $(event.target).closest('td');
        // errors flood the console if the user clicks *just* outside of a cell
        // this stops that (hopefully);
        if (clickedCell.length === 0) return;
        if (clickedCell[0].className == 'clicked' && rightButton === false) {
            switch (event.which) {
                case 1:
                    // left
                    leftButton = true;
                    break;
                case 3:
                    // right
                    rightButton = true;
                    break;
                default:
                    // anything else
                    break;
            }
        }
        else if (clickedCell[0].className === 'clicked' && rightButton === true) {
            switch (event.which) {
                case 1:
                    // left
                    leftButton = true;
                    chordCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    break;
            }
        }
    });
    $('#grid:has(td)').bind('contextmenu', function() {
        return false;
    });
    $('#grid:has(td)').bind('long-press', function(event) {
        const clickedCell = $(event.target).closest('td');
        // errors flood the console if the user clicks *just* outside of a cell
        // this stops that (hopefully);
        if (clickedCell.length === 0) return;
        if (clickedCell[0].innerHTML == '') {
                    flagCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    return;
            }
        // if cell is flagged
        else if (clickedCell[0].innerHTML == '🚩') {
                    questionCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    return;
        }
        else if (clickedCell[0].innerHTML == '❓') {
                    questionCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
                    return;
        }
        else {
            chordCell(clickedCell[0].parentNode.rowIndex, clickedCell[0].cellIndex);
            return;
        }
    });
}
function disableClicks() {
    $('#grid:has(td)').off('mouseup');
    $('#grid:has(td)').off('mousedown');
    $('#grid:has(td)').css;
    $('#grid:has(td)').off('long-press');
}
function clickCell(x, y) {
    disableClicks();
    socket.emit('boardClick', x, y, (board, state) => {
        globalState = state;
        if (state === 'inProgress') {
            updateGrid(board);
        }
        else if (state === 'failed') {
            boom.play();
            generateGrid(board);
            disableClicks();
            blurGrid();
            timer.stop();
            showFailStatus();
        }
        else {
            generateGrid(board);
            const container = document.getElementById('confetti');
            confetti(container, config);
            victory.play();
            disableClicks();
            blurGrid();
            timer.stop();
            showWinStatus();
        }
    });
}
function flagCell(x, y) {
    disableClicks();
    socket.emit('flagClick', x, y, (board) => {
        // generateGrid(board);
        updateGrid(board);
    });
}
function questionCell(x, y) {
    disableClicks();
    socket.emit('questionClick', x, y, (board) => {
        updateGrid(board);
    });
}
function chordCell(x, y) {
    disableClicks();
    socket.emit('chordClick', x, y, (board, state, valid) => {
        globalState = state;
        if (valid === true) {
            if (state === 'inProgress') {
                updateGrid(board);
            }
            else if (state === 'failed') {
                boom.play();
                generateGrid(board);
                disableClicks();
                blurGrid();
                timer.stop();
                showFailStatus();
            }
            else {
                generateGrid(board);
                const container = document.getElementById('confetti');
                confetti(container, config);
                victory.play();
                disableClicks();
                blurGrid();
                timer.stop();
                showWinStatus();
            }
        }
        else {
            enableClicks();
            const grid = document.getElementById('grid');
            const row = grid.rows[x];
            const cell = row.cells[y];
            error.play();
            cell.className = 'mine';
            setTimeout(() => {
                cell.className = 'clicked';
            }, 100);
        }

    });
}
function newBoard() {
    disableClicks();
    socket.emit('newBoard', globalState, (board) => {
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
function updateFlagCounter() {
    const newStr = 'flags: ' + flagCounter.toString();
    $('#flagCount').text(newStr);
}
function initialMines(mines) {
    const newStr = `mines: ${mines}`;
    $('#mineCount').text(newStr);
}
function clearStatus() {
    $('#status').hide();
}
function showFailStatus() {
    $('#status').show();
    $('#status').text('Failed! :(');
}
function showWinStatus() {
    $('#status').show();
    $('#status').text('Victory! :)');
}

function log(str) {
    console.log(str);
}

socket.on('connect', () => {
    log('connection event fired');
});

socket.on('connect_error', (err) => {
    log('connection_error event fired, ' + err);
});

socket.on('connect_timeout', (err) => {
    log('connection_timeout event fired, ' + err);
});

socket.on('error', (err) => {
    log('error event fired, ' + err);
});

socket.on('disconnect', (err) => {
    $('#status').show();
    $('#status').text('Reconnecting...');
    blurGrid();
    disableClicks();
    log('disconnect event fired, ' + err);
});
socket.on('reconnect', (attemptNumber) => {
    $('#status').hide();
    enableClicks();
    unblurGrid();
    log('reconnect event fired, attempt ' + attemptNumber);
});
socket.on('reconnect_attempt', (attemptNumber) => {
    log('reconnect_attempt event fired, attempt' + attemptNumber);
});
socket.on('reconnecting', (attemptNumber) => {
    log('reconnecting event fired, attempt ' + attemptNumber);
});
socket.on('reconnect_error', (err) => {
    log('reconnect error event fired, err is ' + err);
});
socket.on('reconnect_failed', () => {
    log('reconnected failed event fired');
});