// imports
const Discord = require('discord.js');
const fs = require('fs');
let config;
try {
    if (fs.existsSync('./config.json')) {
        config = require('./config.json');
    }
}
 catch (err) {
    console.log('starting in prod mode');
}
// const config = require('./config.json');
const commandList = require('./commands/command');

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { static } = require('express');
const boardClean = require('./utils/security/boardClean');
const minesweeperBoard = require('./utils/minesweeper/minesweeperBoard');
const { getLinkObject } = require('./utils/common');
const discordSync = require('./utils/discord/discordSync');
const storageHandler = require('./utils/storage/storageHandler');

// start static distribution
app.use(static('dist'));

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

    if (mentioned === true) {
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
    res.sendFile(__dirname + '/dist/index.html');
});

app.get('/mine', async (req, res) => {
    const game = storageHandler.get(req.query.h);
    if (!game) {
        res.sendFile(__dirname + '/dist/index.html');
        return;
    }
    res.sendFile(__dirname + '/dist/mine.html');
});

// start of Karen
// she speaks to the managers

io.of('/sp').on('connection', (socket) => {
    socket.on('getBoard', (tag, fn) => {
        const res = storageHandler.get(tag);
        if (!res) return;
        const cleaned = boardClean.cleanToWeb(res.board);
        fn(cleaned, res.state, res.mines);
    });
    socket.on('boardClick', async (x, y, tag, fn) => {
        let res = storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const{ board, state } = minesweeperBoard.clickCell(res.board, x, y);
        res.board = board;
        res.state = state;
        storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(board);
        const message = await getLinkObject(res.messageLink, client);
        res = storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state);
    });
    socket.on('flagClick', async (x, y, tag, fn) => {
        let res = storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const { board, state } = minesweeperBoard.flagCell(res.board, x, y);
        res.board = board;
        res.state = state;
        storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(board);
        const message = await getLinkObject(res.messageLink, client);
        res = storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state);
    });
    socket.on('newBoard', async (tag, state, fn) => {
        let res = storageHandler.get(tag);
        if (!res) return;
        const newBoard = minesweeperBoard.generate(res.difficulty);
        res.board = newBoard;
        res.state = 'inProgress';
        if (state !== 'complete') {
            res.loss++;
        }
        else {
            res.wins++;
        }
        storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(res.board);
        const message = await getLinkObject(res.messageLink, client);
        res = storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, res.state);

    });
});

// everything after this point doesn't need to be touched normally

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});

client.on('ready', () => {
    console.log(`I'm up, and i'm part of ${client.guilds.cache.size} servers`);
});

if (!config) {
    client.login(process.env.DISCORD_TOKEN)
    .then(console.log('Logging In'))
    .catch(console.error);
}
else {
    client.login(config.token)
    .then(console.log('Logging In'))
    .catch(console.error);

}

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