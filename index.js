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
const { getLinkObject, deepClone } = require('./utils/common');
const discordSync = require('./utils/discord/discordSync');
const storageHandler = require('./utils/storage/storageHandler');
const connectionCheck = require('./utils/security/connectionCheck');
const mongoose = require('mongoose');
const { infoBoard } = require('./models/infoStore');

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
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const game = await storageHandler.get(req.query.h);
    if (!game) {
        res.sendFile(__dirname + '/dist/index.html');
        return;
    }
    const connected = connectionCheck.get(req.query.h);
    if (connected) {
        res.sendFile(__dirname + '/dist/connected.html');
        return;
    }
    res.sendFile(__dirname + '/dist/mine.html');
});

// start of Karen
// she speaks to the managers

io.use((socket, next) => {
    const token = socket.handshake.query.tag;
    const check = connectionCheck.get(token);
    if (check) {
       return next(new Error ('board already connected'));
    }
    return next();
});

io.use(async (socket, next) => {
    const token = socket.handshake.query.tag;
    const res = await storageHandler.get(token);
    if (!res) {
        return next(new Error('board not found'));
    }
    return next();
});

io.of('/sp').on('connection', (socket) => {
    const tag = socket.handshake.query.tag;
    connectionCheck.set(tag);
    socket.on('getBoard', async (fn) => {
        // get the board
        const res = await storageHandler.get(tag);
        if (!res) return;
        // clean it for the web
        const cleaned = boardClean.cleanToWeb(deepClone(res.board));
        let timeElapsed = 0;
        if (res.time === 0) {
            timeElapsed = 0;
        }
        else {
            timeElapsed = Date.now() - res.time;
        }
        // send it back to the client
        fn(cleaned, res.state, res.mines, timeElapsed);
    });
    socket.on('boardClick', async (x, y, fn) => {
        // get the board
        let res = await storageHandler.get(tag);
        // if it doesn't exist, or if it's already finished, reject it
        if (!res || res.state !== 'inProgress') {
            return;
        }
        // click the cell, checking if it's the first hit
        const{ board, state, firstClicked } = minesweeperBoard.clickCellSafely(res.board, x, y, res.difficulty);
        res.board = board;
        res.state = state;
        if (state === 'complete') {
            infoBoard.addWin();
        }
        else if (state === 'failed') {
            infoBoard.addLoss();
        }
        if (firstClicked === true) {
            console.log('firstclick');
            res.time = Date.now();
        }
        // re-store it
        await storageHandler.set(tag, res);
        // clean for the web
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        // get the message object
        const message = await getLinkObject(res.messageLink, client);
        // reget the actual board
        // this is mostly legacy code from when cleanToWeb mutated the board
        // this SHOULDN'T be nessesary anymore but i'm scared to remove it
        res = await storageHandler.get(tag);
        // send the board to the discord update queue
        discordSync.sp.updateBoard(message.message, res);
        const ms = Date.now() - res.time;
        console.log(`time sent from server is ${ms}`);
        fn(cleaned, state, ms);
    });
    socket.on('flagClick', async (x, y, fn) => {
        let res = await storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const { board, state } = minesweeperBoard.flagCell(res.board, x, y);
        res.board = board;
        res.state = state;
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state);
    });
    socket.on('questionClick', async (x, y, fn) => {
        let res = await storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const { board, state } = minesweeperBoard.questionCell(res.board, x, y);
        res.board = board;
        res.state = state;
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state);
    });
    socket.on('chordClick', async (x, y, fn) => {
        let res = await storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const { tempboard: board, tempState: state, valid } = minesweeperBoard.chordCell(res.board, x, y);
        if (!valid) {
            fn(null, 'inProgress', valid);
            return;
        }
        res.board = board;
        res.state = state;
        if (state === 'complete') {
            infoBoard.addWin();
        }
        else if (state === 'failed') {
            infoBoard.addLoss();
        }
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        const ms = Date.now() - res.time;
        fn(cleaned, state, valid, ms);
    });
    socket.on('newBoard', async (state, fn) => {
        let res = await storageHandler.get(tag);
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
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(res.board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, res.state);

    });
    socket.on('keepAlive', () => {
        connectionCheck.set(socket.handshake.query.tag);
    });
    socket.on('disconnect', () => {
        connectionCheck.del(tag);
    });
});

// everything after this point doesn't need to be touched normally

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
});

client.on('ready', () => {
    console.log(`I'm up, and i'm part of ${client.guilds.cache.size} servers`);
    let db;
    if (!config) {
        db = process.env.MONGO_DB;
    }
    else {
        db = config.db;
    }
    mongoose.connect(db, ({ useNewUrlParser: true, useUnifiedTopology: true }))
    .then(() => {
        console.log('Connection to MongoDB successfully established');
    })
    .catch(console.error);

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
