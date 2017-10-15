/*global Tone, noUiSlider*/
const EQUALIZER_CENTER_FREQUENCIES = [
    100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
    1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000
];



let leftSynth = makeSynth();
let rightSynth = makeSynth();
let leftPanner = new Tone.Panner(-0.5);
let rightPanner = new Tone.Panner(0.5);

let equalizer = EQUALIZER_CENTER_FREQUENCIES.map(frequency => {
    let filter = Tone.context.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = frequency;
    filter.Q.value = 4.31;
    filter.gain.value = 0;
    return filter;
});


let echo = new Tone.FeedbackDelay('16n', 0.2);
let delay = Tone.context.createDelay(6.0); // Borrow the AudioContext from Tone.js
let delayFade = Tone.context.createGain();

delay.delayTime.value = 6.0;
delayFade.gain.value = 0.75;

leftSynth.connect(leftPanner);
rightSynth.connect(rightPanner);


leftPanner.connect(equalizer[0]);
rightPanner.connect(equalizer[0]);
equalizer.forEach((equalizerBand, index) => {
    if (index < equalizer.length - 1) {
        // Connect to next equalizer band
        equalizerBand.connect(equalizer[index + 1]);
    } else {
        // This is the last band, connect it to the echo
        equalizerBand.connect(echo);
    }
});


echo.toMaster();
echo.connect(delay);
delay.connect(Tone.context.destination);
delay.connect(delay);

new Tone.Loop(time => {
    leftSynth.triggerAttackRelease('C5', '1n + 2n', time);
    leftSynth.setNote('D5', '+2n');

    // Trigger E4 after 6 measures and hold for two 1/4 notes.
    leftSynth.triggerAttackRelease('E4', '0:2', '+6:0');

    // Trigger G4 after 11 measures + a two 1/4 notes, and hold for two 1/4 notes.
    leftSynth.triggerAttackRelease('G4', '0:2', '+11:2');

    // Trigger E5 after 19 measures and hold for 2 measures.
    // Switch to G5, A5, G5 after delay of a 1/4 note + two 1/16 notes each.
    leftSynth.triggerAttackRelease('E5', '2:0', '+19:0');
    leftSynth.setNote('G5', '+19:1:2');
    leftSynth.setNote('A5', '+19:3:0');
    leftSynth.setNote('G5', '+19:4:2');
}, '34m').start();

new Tone.Loop(time => {
    // Trigger D4 after 5 measures and hold for 1 full measure + two 1/4 notes
    rightSynth.triggerAttackRelease('D4', '1:2', '+5:0');
    // Switch to E4 after one more measure
    rightSynth.setNote('E4', '+6:0');

    // Trigger B3 after 11 measures + two 1/4 notes + two 1/16 notes. Hold for one measure
    rightSynth.triggerAttackRelease('B3', '1m', '+11:2:2');
    // Switch to G3 after a 1/2 note more
    rightSynth.setNote('G3', '+12:0:2');

    // Trigger G4 after 23 measures + two 1/4 notes. Hold for a half note.
    rightSynth.triggerAttackRelease('G4', '0:2', '+23:2');
}, '37m').start();

Tone.Transport.start();

initEqualizerUI(document.querySelector('.eq'), equalizer);

function makeSynth() {
    let envelope = {
        attack: 0.1,
        release: 4,
        releaseCurve: 'linear'
    };
    let filterEnvelope = {
        baseFrequency: 200,
        octaves: 2,
        attack: 0,
        decay: 0,
        release: 1000
    };
    return new Tone.DuoSynth({
        volume: -20,
        harmonicity: 1,
        vibratoRate: 0.5,
        vibratoAmount: 0.1,
        voice0: {
            oscillator: { type: 'sawtooth' },
            envelope,
            filterEnvelope
        },
        voice1: {
            oscillator: { type: 'sine' },
            envelope,
            filterEnvelope
        }
    });
}

function initEqualizerUI(container, equalizer) {
    equalizer.forEach(band => {
        let frequency = band.frequency.value;
        let wrapper = document.createElement('div');
        let slider = document.createElement('div');
        let label = document.createElement('label');

        wrapper.classList.add('slider-wrapper');
        slider.classList.add('slider');
        label.textContent = frequency >= 1000 ? `${frequency / 1000}K` : frequency;

        noUiSlider.create(slider, {
            start: -12,                     // The initial gain, 0dB
            range: { min: -12, max: 12 }, // The allowed gain range, -12dB..12dB
            step: 0.1,                    // Adjust the gain in 0.1dB increments
            orientation: 'vertical',      // Render a vertical slider
            direction: 'rtl'              // -12dB goes at the bottom, 12dB at the top
        });
        slider.noUiSlider.on('update', ([value]) => {
            band.gain.value = Number(value);
        });

        wrapper.appendChild(slider);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}

