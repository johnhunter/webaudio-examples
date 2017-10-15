export class HarmonicSynth {

    /**
     * Given an array of overtone amplitudes, construct an additive
     * synth for that overtone structure
     */
    constructor(audioCtx, partialAmplitudes) {
        this.partials = partialAmplitudes.map(() => audioCtx.createOscillator());
        this.partialGains = partialAmplitudes.map(() => audioCtx.createGain());
        this.masterGain = audioCtx.createGain();

        partialAmplitudes.forEach((amp, index) => {
            this.partialGains[index].gain.value = amp;
            this.partials[index].connect(this.partialGains[index]);
            this.partialGains[index].connect(this.masterGain);
        });
        this.masterGain.gain.value = 1 / partialAmplitudes.length;

    }

    connect(dest) {
        this.masterGain.connect(dest);
    }

    disconnect() {
        this.masterGain.disconnect();
    }

    start(time = 0) {
        this.partials.forEach(o => o.start(time));
    }

    stop(time = 0) {
        this.partials.forEach(o => o.stop(time));
    }

    setFrequencyAtTime(frequency, time) {
        // Set harmonics from base frequency
        this.partials.forEach((o, index) => {
            o.frequency.setValueAtTime(frequency * (index + 1), time);
        });
    }

    exponentialRampToFrequencyAtTime(frequency, time) {
        this.partials.forEach((o, index) => {
            o.frequency.exponentialRampToValueAtTime(frequency * (index + 1), time);
        });
    }
}
