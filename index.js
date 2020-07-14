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
    const game = await storageHandler.get(req.query.h);
    if (!game) {
        res.sendFile(__dirname + '/dist/index.html');
        return;
    }
    const connected = connectionCheck.get(req.query.h);
    if (connected) {
        res.sendFile(__dirname + '/dist/index.html');
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

io.of('/sp').on('connection', (socket) => {
    const tag = socket.handshake.query.tag;
    connectionCheck.set(tag);
    socket.on('getBoard', async (fn) => {
        const res = await storageHandler.get(tag);
        if (!res) return;
        // i have no idea what i'm doing
        const cleaned = boardClean.cleanToWeb(deepClone(res.board));
        fn(cleaned, res.state, res.mines);
    });
    socket.on('boardClick', async (x, y, fn) => {
        let res = await storageHandler.get(tag);
        if (!res || res.state !== 'inProgress') {
            return;
        }
        const{ board, state } = minesweeperBoard.clickCellSafely(res.board, x, y, res.difficulty);
        res.board = board;
        res.state = state;
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state);
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
        await storageHandler.set(tag, res);
        const cleaned = boardClean.cleanToWeb(deepClone(board));
        const message = await getLinkObject(res.messageLink, client);
        res = await storageHandler.get(tag);
        discordSync.sp.updateBoard(message.message, res);
        fn(cleaned, state, valid);
    });
    socket.on('newBoard', async (state, fn) => {
        let res = await storageHandler.get(tag);
        if (!res) return;
        const newBoard = minesweeperBoard.generate(res.difficulty);
        res.board = newBoard;
        res.state = 'inProgress';
        if (state !== 'complete') {
            res.loss++;
            infoBoard.addLoss();
        }
        else {
            res.wins++;
            infoBoard.addWin();
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
