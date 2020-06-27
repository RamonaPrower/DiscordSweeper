// require all commands here

const minesweeper = require('./command/minesweeper');
const web = require('./command/web');

// add to array
const messageCommands = [minesweeper, web];

// export to index.js

module.exports.messageCommands = messageCommands;