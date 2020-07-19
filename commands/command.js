// require all commands here

const minesweeper = require('./command/minesweeper');
const web = require('./command/web');
const info = require('./command/info');
const stats = require('./command/stats');

// add to array
const messageCommands = [minesweeper, web, info, stats];

// export to index.js

module.exports.messageCommands = messageCommands;