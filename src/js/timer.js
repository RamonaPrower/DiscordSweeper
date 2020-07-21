window.$ = require('jquery');
const { DuckTimer } = require('duck-timer');

let timer;
// so you may be asking "why the fuck are we making new DuckTimers each time"
// DuckTimer does TECHNICALLY expose a way for you to update the time within itself
// however, for some reason, this seems to remove not only the current onInterval
// but also REMOVES the ability to set an onInterval entirely, even if you restate it.
// I've tried everything else and this is my only option.
// one of the big todo's is to either pull and fix the bug, whatever it is,
// or just write my own timer function.
module.exports = {
    init: function(ms) {
        const updateTime = !ms ? 0 : JSON.parse(JSON.stringify(ms));
        console.log(`updateTime is ${updateTime}`);
        timer = new DuckTimer({ setTime: updateTime });
        const actualTime = timer.getClock();
        const minCount = actualTime.minutes;
        let calcSecs = actualTime.seconds - (minCount * 60);
        if (calcSecs < 10) calcSecs = '0' + calcSecs;
        const str = `Timer: ${minCount}:${calcSecs}`;
        $('#timer').text(str);
        setInterval(() => {
            const res = timer.getClock();
            let intminCount = 0;
            if (res.minutes > 0) {
                intminCount = res.minutes;
            }
            let intcalcSecs = res.seconds - (intminCount * 60);
            if (intcalcSecs < 10) intcalcSecs = '0' + intcalcSecs;
            const newStr = `Timer: ${intminCount}:${intcalcSecs}`;
            $('#timer').text(newStr);
            console.log('ticking from start');
        }, 1000);
        if (updateTime !== 0) {
            timer.start();
        }
    },
    start: function() {
        const updateTime = timer.time;
        timer = null;
        timer = new DuckTimer({
            setTime: updateTime,
        });
        timer.start();
    },
    update: function(ms) {
        const updateTime = !ms ? timer.time : JSON.parse(JSON.stringify(ms));
        console.log(`updateTime is ${updateTime}`);
        timer.stop();
        timer = null;
        timer = new DuckTimer({ setTime: updateTime });
        console.log(`${timer.time} is current time on DT`);
        timer.start();
    },
    stop: function(ms) {
        timer.stop();
        if (ms) timer.time = ms;
        const actualTime = timer.getClock();
        const minCount = actualTime.minutes;
        let calcSecs = actualTime.seconds - (minCount * 60);
        if (calcSecs < 10) calcSecs = '0' + calcSecs;
        const str = `Timer: ${minCount}:${calcSecs}`;
        $('#timer').text(str);
    },
};