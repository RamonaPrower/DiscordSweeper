const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema({
    wins: {
        type: Number,
        default: 0,
    },
    loss: {
        type: Number,
        default: 0,
    },
});

infoSchema.statics.addWin = async function() {
    let result = await this.findOne();
    if (!result) {
        const newEntr = new infoBoard();
        await newEntr.save();
        result = await this.findOne();
    }
    result.wins++;
    await result.save();
};

infoSchema.statics.addLoss = async function() {
    let result = await this.findOne();
    if (!result) {
        const newEntr = new infoBoard();
        await newEntr.save();
        result = await this.findOne();
    }
    result.loss++;
    await result.save();
};

infoSchema.statics.getWins = async function() {
    const result = await this.findOne();
    return result.wins;
};
infoSchema.statics.getLoss = async function() {
    const result = await this.findOne();
    return result.loss;
};

const infoBoard = mongoose.model('Info', infoSchema);
exports.infoBoard = infoBoard;