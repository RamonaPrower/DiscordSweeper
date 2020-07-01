/* eslint-disable no-undef */
const io = require('socket.io-client');
window.$ = require('jquery');
const { Howl, Howler } = require('howler');
const { confetti } = require('dom-confetti');
const { DuckTimer } = require('duck-timer');
const { min } = require('moment');
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
let flagCounter;
const params = new URLSearchParams(document.location.search.substring(1));
const tag = params.get('h');
const socket = io('/sp');
$('#newBoardButton').click(() => {
    newBoard();
});

const toggle = document.querySelector('.theme input');
const toggleSpan = document.querySelector('#checkBoxImg');

function switchTheme(tog) {
    if (tog.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleSpan.innerHTML = '<i class="far fa-lightbulb"></i>';
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleSpan.innerHTML = '<i class="fas fa-lightbulb"></i>';
    }
}
toggle.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggle.checked = true;
        toggleSpan.innerHTML = '<i class="far fa-lightbulb"></i>';
    }
    else {
        toggleSpan.innerHTML = '<i class="fas fa-lightbulb"></i>';
    }
}


socket.emit('getBoard', tag, (board, state, mines) => {
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
                flagCounter++;
                cell.className = 'mine';
            }
            else if (board[i][j].revealed === false && board[i][j].flagged === true) {
                flagCounter++;
                cell.innerHTML = '🚩';
                cell.className = 'flag';
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