import {playSample, reverbConvolver} from '../utils/sampler.js';


const audioContext = new AudioContext();
reverbConvolver(audioContext).then(playPiece);

function playPiece (convolver) {
    startLoop('Grand Piano', 'F4',  convolver, 19.7, 4.0);
    startLoop('Grand Piano', 'Ab4', convolver, 17.8, 8.1);
    startLoop('Grand Piano', 'C5',  convolver, 21.3, 5.6);
    startLoop('Grand Piano', 'Db5', convolver, 22.1, 12.6);
    startLoop('Grand Piano', 'Eb5', convolver, 18.4, 9.2);
    startLoop('Grand Piano', 'F5',  convolver, 20.0, 14.1);
    startLoop('Grand Piano', 'Ab5', convolver, 17.7, 3.1);
}

function startLoop(instrument, note, convolverDestination, loopLengthSeconds, delaySeconds) {
    const speed = .5;
    loopLengthSeconds *= speed;
    delaySeconds *= speed;
    const run = () => playSample(audioContext, instrument, note, convolverDestination, delaySeconds);
    setInterval(run, loopLengthSeconds * 1000);
    run();
}

