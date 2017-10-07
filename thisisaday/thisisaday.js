console.log("This is a day");

const filename = 'samples/jesse_jackson.mp3';
const audioContext = new AudioContext();


function startLoop(audioBuffer, start, stop, pan = 0, rate = 1) {
    const sourceNode = audioContext.createBufferSource();
    const pannerNode = audioContext.createStereoPanner();

    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.loopStart = start;
    sourceNode.loopEnd = stop;
    sourceNode.playbackRate.value = rate;
    pannerNode.pan.value = pan;

    sourceNode.connect(pannerNode);
    pannerNode.connect(audioContext.destination);

    sourceNode.start(0, start);
}

fetch(filename)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        let phasePercentage = 5;
        let start = 7.20;
        let stop = 8.40;
        stop = 9.71;
        startLoop(audioBuffer, start, stop, -1);
        startLoop(audioBuffer, start, stop, 1, 1 + (phasePercentage/100));
    })
    .catch(e => console.error(e));
