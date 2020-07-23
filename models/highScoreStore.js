// create a mongoose schema for storing the board_store

const mongoose = require('mongoose');

const highScoreSchema = new mongoose.Schema({
    easy: {
        type: Array,
        required: true,
    },
    medium: {
        type: Array,
        required: true,
    },
    hard: {
        type: Array,
        required: true,
    },
});

highScoreSchema.statics.checkHighScore = async function(difficulty, ms) {
    let highScoreArray = await this.findOne();
    if (!highScoreArray) {
        const newEnt = new HighScoreModel();
        await newEnt.save();
        highScoreArray = await this.findOne();
    }
    const highScoreDiffArray = await highScoreArray.get(difficulty);
    const highScoreSortedArray = highScoreDiffArray.sort((a, b) => {
        return a.value - b.value;
    });
    const highScoreMorphedArr = highScoreSortedArray.push({ name: 'test', time: ms });
    const highScoreNewSorted = highScoreMorphedArr.sort((a, b) => {
        return a.value - b.value;
    });
    const testPosition = highScoreNewSorted.indexOf({ name: 'test', time: ms });
    if (testPosition > 9) return false;
    else return true;
};

const HighScoreModel = mongoose.model('HighScore', highScoreSchema);
exports.HighScoreModel = HighScoreModel;