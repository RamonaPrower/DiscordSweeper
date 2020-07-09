// create a mongoose schema for storing the board_store

const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
    },
    board: {
        type: Object,
        required: true,
    },
});

boardSchema.statics.checkBoard = async function(tag) {
    return this.findOne({
        tag: tag,
    });
};

const MongoBoard = mongoose.model('Board', boardSchema);
exports.MongoBoard = MongoBoard;