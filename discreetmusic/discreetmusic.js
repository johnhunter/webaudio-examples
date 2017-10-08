
const envelope = {
    attack: 0.1,
    release: 4,
    releaseCurve: 'linear'
};
const filterEnvelope = {
    baseFrequency: 200,
    octaves: 2,
    attack: 0,
    decay: 0,
    release: 1000
};

const synth = new Tone.DuoSynth({
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
synth.toMaster();
synth.triggerAttackRelease('C4', 1);
