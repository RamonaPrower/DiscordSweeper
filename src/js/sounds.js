const { Howl, Howler } = require('howler');
const toggle = document.querySelector('.sounds input');
const toggleSpan = document.querySelector('#soundBoxImg');

function switchVolume(tog) {
    if (tog.target.checked) {
        Howler.volume(0);
        localStorage.setItem('sound', 'muted');
        toggleSpan.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    else {
        Howler.volume(1);
        localStorage.setItem('sound', 'loud');
        toggleSpan.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}
toggle.addEventListener('change', switchVolume, false);
const currentSound = localStorage.getItem('sound') ? localStorage.getItem('sound') : 'loud';
if (currentSound) {
    if (currentSound === 'muted') {
        Howler.volume(0);
        toggleSpan.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    else {
        Howler.volume(100);
        toggleSpan.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

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
const question = new Howl({
    src: ['/sounds/question.wav'],
    volume: 0.2,
});
exports.question = question;