// require all commands here

const minesweeper = require('./command/minesweeper');

// add to array
const messageCommands = [minesweeper];

// export to index.js

module.exports.messageCommands = messageCommands;