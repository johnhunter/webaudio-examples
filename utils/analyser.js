const smoothing = 0.8;
const fftSize = 1024;

export function frequencyChart({
    audioContext,
    source,
    destination = audioContext.destination,
    container = document.querySelector('body')
}) {

    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(destination);
    analyser.minDecibels = -140;
    analyser.maxDecibels = 0;

    analyser.smoothingTimeConstant = smoothing;
    analyser.fftSize = fftSize;

    const size = { width: 400, height: 250 };
    const drawContext = createCanvas(container, size);

    const binCount = analyser.frequencyBinCount;
    const freqDomain = new Uint8Array(binCount);
    const timeDomain = new Uint8Array(binCount);

    window.requestAnimationFrame(() => {
        const barDimensions = (value) => {
            let percent = value / 256;
            let height = size.height * percent;
            return {
                height,
                barWidth: size.width / binCount,
                offset: size.height - height - 1
            }
        };

        analyser.getByteFrequencyData(freqDomain);
        for (let i = 0; i < binCount; i++) {
            let hue = i / binCount * 360;
            let fValue = freqDomain[i];
            let { barWidth, offset, height } = barDimensions(fValue);
            drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            drawContext.fillRect(i * barWidth, offset, barWidth, height);
        }

        analyser.getByteTimeDomainData(timeDomain);
        for (let i = 0; i < binCount; i++) {
            let { barWidth, offset } = barDimensions(timeDomain[i]);
            drawContext.fillStyle = 'black';
            drawContext.fillRect(i * barWidth, offset, 1, 1);
        }
    });
}

function createCanvas(container, size) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        border: 1px solid #000;
    `;
    container.innerHTML = '';
    container.appendChild(canvas);
    canvas.width = size.width;
    canvas.height = size.height;
    return canvas.getContext('2d');;
}



