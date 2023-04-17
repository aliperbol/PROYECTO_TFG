// create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// create analyser node
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// create oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

// connect oscillator to analyser
oscillator.connect(analyser);

// connect analyser to destination
analyser.connect(audioCtx.destination);

// get canvas and context
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// draw sine wave
function drawSineWave() {
  requestAnimationFrame(drawSineWave);

  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(255, 255, 255)";

  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

// draw frequency bars
function drawFrequencyBars() {
  requestAnimationFrame(drawFrequencyBars);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2;

    ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
}

// switch between visualizers
const sineWaveButton = document.getElementById("sine-wave-button");
const frequencyBarsButton = document.getElementById("frequency-bars-button");

sineWaveButton.addEventListener("click", () => {
  oscillator.type = "sine";
  oscillator.start();
  drawSineWave();
  frequencyBarsButton.disabled = false;
  sineWaveButton.disabled = true;
});

frequencyBarsButton.addEventListener("click", () => {
  oscillator.type = "triangle";
  oscillator.start();
  drawFrequencyBars();
  sineWaveButton.disabled = false;
  frequencyBarsButton.disabled = true;
});
