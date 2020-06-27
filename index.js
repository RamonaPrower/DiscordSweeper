// imports
const Discord = require('discord.js');
const config = require('./config.json');
const commandList = require('./commands/command');

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { static } = require('express');
const qdCache = require('qdcache');
const boardClean = require('./utils/security/boardClean');
const minesweeperBoard = require('./utils/minesweeper/minesweeperBoard');

// start static distribution
app.use(static('public'));

// start client
const client = new Discord.Client;

// message commands
client.messageCommands = new Discord.Collection();
const messageCommList = commandList.messageCommands;
for (const file of messageCommList) {
    client.messageCommands.set(file.settings.regexp, file);
}

// insert message loops here

client.on('message', message => {
    const mentioned = message.mentions.has(client.user);
    if (message.author.bot) return;

    if (mentioned === true || config.dev === true) {
        for (const [key, value] of client.messageCommands) {
            const newReg = key;
            if (newReg.test(message.content)) {
                value.execute(message);
                break;
            }
        }
    }
});

// webpage routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/mine', async (req, res) => {
    const game = qdCache.get(req.query.h);
    if (!game) {
        res.sendFile(__dirname + '/public/index.html');
        return;
    }
    res.sendFile(__dirname + '/public/mine.html');
});

io.of('/sp').on('connection', (socket) => {
    socket.on('getBoard', (tag, fn) => {
        const res = qdCache.get(tag);
        const cleaned = boardClean.cleanToWeb(res.board);
        fn(cleaned);
    });
    socket.on('boardClick', (x, y, tag, fn) => {
        const res = qdCache.get(tag);
        console.log(`x${x}y${y}`);
        if (!res) {
            return;
        }
        const{ board, state } = minesweeperBoard.clickCell(res.board, x, y);
        res.board = board;
        qdCache.set(tag, res);
        const cleaned = boardClean.cleanToWeb(board);
        if (state !== 'inProgress') {
            qdCache.delete(tag);
        }
        fn(cleaned, state);
    });
});

// everything after this point doesn't need to be touched normally

http.listen(3000, () => {
    console.log('listening on http://localhost:3000');
});

client.on('ready', () => {
	console.log(`I'm up, and i'm part of ${client.guilds.cache.size} servers`);
});

client.login(config.token)
    .then(console.log('Logging In'))
    .catch(console.error);

client.on('error', data => {
    console.error('Connection Error', data.message);
});

client.on('disconnect', data => {
    console.error('I have Disconnected', data.message);
    autoRestartServer();
});

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

function autoRestartServer() {
    setTimeout(() => {
        if (!client.status == 0) process.exit(1);
    }, 1500);
}