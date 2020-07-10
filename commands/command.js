// require all commands here

const minesweeper = require('./command/minesweeper');
const web = require('./command/web');
const info = require('./command/info');

// add to array
const messageCommands = [minesweeper, web, info];

// export to index.js

module.exports.messageCommands = messageCommands;