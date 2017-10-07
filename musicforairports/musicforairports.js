
console.log('Music for airports');

const PATH = 'samples/';
const SAMPLE_LIBRARY = {
    'Grand Piano': [
        { note: 'A', octave: 4, file: 'piano-f-a4.wav' },
        { note: 'A', octave: 5, file: 'piano-f-a5.wav' },
        { note: 'A', octave: 6, file: 'piano-f-a6.wav' },
        { note: 'C', octave: 4, file: 'piano-f-c4.wav' },
        { note: 'C', octave: 5, file: 'piano-f-c5.wav' },
        { note: 'C', octave: 6, file: 'piano-f-c6.wav' },
        { note: 'D#', octave: 4, file: 'piano-f-d#4.wav' },
        { note: 'D#', octave: 5, file: 'piano-f-d#5.wav' },
        { note: 'D#', octave: 6, file: 'piano-f-d#6.wav' },
        { note: 'F#', octave: 4, file: 'piano-f-f#4.wav' },
        { note: 'F#', octave: 5, file: 'piano-f-f#5.wav' },
        { note: 'F#', octave: 6, file: 'piano-f-f#6.wav' }
    ]
};
const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const audioContext = new AudioContext();

fetchSample(`${PATH}airportTerminal.wav`).then(convolverBuffer => {
    let convolver = audioContext.createConvolver();
    convolver.buffer = convolverBuffer;
    convolver.connect(audioContext.destination);

    // run the piece...
    startLoop('Grand Piano', 'F4',  convolver, 19.7, 4.0);
    startLoop('Grand Piano', 'Ab4', convolver, 17.8, 8.1);
    startLoop('Grand Piano', 'C5',  convolver, 21.3, 5.6);
    startLoop('Grand Piano', 'Db5', convolver, 22.1, 12.6);
    startLoop('Grand Piano', 'Eb5', convolver, 18.4, 9.2);
    startLoop('Grand Piano', 'F5',  convolver, 20.0, 14.1);
    startLoop('Grand Piano', 'Ab5', convolver, 17.7, 3.1);
});

function playSample(instrument, note, convolverDestination, delaySeconds = 0) {
    console.log('Play %s %s', instrument, note);
    getSample(instrument, note).then(({ audioBuffer, distance }) => {
        let playbackRate = Math.pow(2, distance / 12);
        let bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.playbackRate.value = playbackRate;
        bufferSource.connect(convolverDestination);
        bufferSource.connect(audioContext.destination);
        bufferSource.start(audioContext.currentTime + delaySeconds);
    });
}

function getSample(instrument, noteAndOctave) {
    const sampleBank = SAMPLE_LIBRARY[instrument];

    let [, note, octave] = /^(\w[b#]?)(\d)$/.exec(noteAndOctave);
    octave = parseInt(octave, 10);
    note = flatToSharp(note);

    let sample = getNearestSample(sampleBank, note, octave);
    let distance = getNoteDistance(note, octave, sample.note, sample.octave);
    return fetchSample(PATH + sample.file).then(audioBuffer => ({ audioBuffer, distance }));
}

function fetchSample(path) {
    return fetch(encodeURIComponent(path))
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
    return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
    return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
    let sortedBank = sampleBank.slice().sort((a, b) => {
        let distanceToA = Math.abs(getNoteDistance(note, octave, a.note, a.octave));
        let distanceToB = Math.abs(getNoteDistance(note, octave, b.note, b.octave));
        return distanceToA - distanceToB;
    });
    return sortedBank[0];
}

function flatToSharp(note) {
    switch (note) {
        case 'Bb': return 'A#';
        case 'Db': return 'C#';
        case 'Eb': return 'D#';
        case 'Gb': return 'F#';
        case 'Ab': return 'G#';
        default: return note;
    }
}

function startLoop(instrument, note, destination, loopLengthSeconds, delaySeconds) {
    playSample(instrument, note, destination, delaySeconds);
    setInterval(
        () => playSample(instrument, note, destination, delaySeconds),
        loopLengthSeconds * 1000
    );
}

//startLoop('Grand Piano', 'C4', 20, 5);
