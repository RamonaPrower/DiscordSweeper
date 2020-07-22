// require all commands here

const minesweeper = require('./command/minesweeper');
const web = require('./command/web');
const info = require('./command/info');
const stats = require('./command/stats');
const patchNotes = require('./command/patchNotes');

// add to array
const messageCommands = [minesweeper, web, info, stats, patchNotes];

// export to index.js

module.exports.messageCommands = messageCommands;