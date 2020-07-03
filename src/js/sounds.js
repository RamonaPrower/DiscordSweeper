const { Howl } = require('howler');
const flip = new Howl({
    src: ['/sounds/click.wav'],
    volume: 0.3,
});
exports.flip = flip;
const boom = new Howl({
    src: ['/sounds/boom.wav'],
    volume: 0.2,
});
exports.boom = boom;
const bell = new Howl({
    src: ['/sounds/flag.wav'],
    volume: 0.3,
});
exports.bell = bell;
const victory = new Howl({
    src: ['/sounds/victory.mp3'],
    volume: 0.3,
});
exports.victory = victory;
const error = new Howl({
    src: ['/sounds/error.wav'],
    volume: 0.3,
});
exports.error = error;
