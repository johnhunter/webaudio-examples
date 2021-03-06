import { onFileDrop, fileToBuffer } from '../utils/filedrop.js';
import { frequencyChart } from '../utils/analyser.js';
import '../lib/pitchdetector.js';

const audioContext = new AudioContext();

var dropzone;
var detector;
var chartContainer;

export function initDropzone(selector, activeClass) {
    dropzone = document.querySelector(selector);
    chartContainer = document.createElement('div');
    dropzone.insertAdjacentElement('afterend', chartContainer);
    onFileDrop({
        targets: [dropzone],
        activeClass: activeClass,
        callback: handleDrop,
    });
}

function handleDrop(files) {
    let audioFiles = files.filter(f => (/^audio/).test(f.type));
    if (!audioFiles.length) return;

    const file = audioFiles.shift();
    const audioBuffer = fileToBuffer(file).then(data => audioContext.decodeAudioData(data));

    // analyse the buffer
    audioBuffer.then(buffer => {
            showFileDescription(file, buffer);
            detector && detector.destroy();

            let source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = false;
            source.start(0);

            detector = createPitchDetector(source, undefined, onPitchDetect);
            detector.start();
        });

    // play the buffer
    audioBuffer.then(buffer => {
            let source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = false;

            frequencyChart({ audioContext, source, container: chartContainer });
            //source.connect(audioContext.destination);
            source.start(0);
        });
}

function onPitchDetect(stats, pitchDetector) {
    if (stats.detected) {
        dropzone.querySelector('.drop__note').innerHTML = pitchDetector.getNoteString();
         pitchDetector.destroy();
    }
}

function showFileDescription(file, buffer) {
    dropzone.querySelector('.drop__note').innerHTML = '';
    dropzone.querySelector('.drop__desc').innerHTML = `
        <b>${file.name}</b><br>
        (${buffer.duration.toFixed(2)}s, ${(file.size / 1000).toFixed(0)}kb)`;
}

function createPitchDetector(inputNode, outputNode, callback = ()=>{}) {
    // https://github.com/markmarijnissen/PitchDetect/
    return new PitchDetector({
        context: audioContext,
        input: inputNode,
        output: outputNode,
        onDetect: callback,
        // onDebug: function (stats, pitchDetector) {
        //     console.log('Debug: found %s, freq %s ', stats.detected, stats.frequency, stats);
        // },

        // interpolate frequency (Optional)
        //
        // Auto-correlation is calculated for different (discrete) signal periods
        // The true frequency is often in-beween two periods.
        //
        // We can interpolate (very hacky) by looking at neighbours of the best
        // auto-correlation period and shifting the frequency a bit towards the
        // highest neighbour.
        interpolateFrequency: true, // default: true

        // Minimal signal strength (RMS, Optional)
        minRms: 0.01,
        // Detect pitch only with minimal correlation of: (Optional)
        minCorrelation: 0.9,

        // Detect pitch only if correlation increases with at least: (Optional)
        //minCorreationIncrease: 0.5,

        // Note: you cannot use minCorrelation and minCorreationIncrease at the same time!

        // Signal Normalization (Optional)
        normalize: "rms", // or "peak". default: undefined

        // Only detect pitch once: (Optional)
        stopAfterDetection: true,

        // Buffer length (Optional)
        length: 1024, // default 1024

        // Limit range (Optional):
        minNote: 43, // G2  by MIDI note number
        maxNote: 96, // C7

        minFrequency: 90,
        maxFrequency: 20000,

        minPeriod: 2,  // by period (i.e. actual distance of calculation in audio buffer)
        maxPeriod: 512, // --> convert to frequency: frequency = sampleRate / period
    });
}

