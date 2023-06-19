const msg = document.querySelector("output");
const canvasKey = document.querySelector("#canvas");
const visualSelector = document.querySelector("#visual");
var play_pause_button = document.getElementById("play-pause-button");
const length = document.querySelector(".length");
const current = document.querySelector(".current");
const volumeSelector = document.querySelector("#volume-selector-slider");
const pannerSelector = document.querySelector("#panner-selector-slider");
const lowpassSelector = document.querySelector("#lowpass-selector-slider");
const highpassSelector = document.querySelector("#highpass-selector-slider");
const nombre = document.querySelector(".nombre");
const colorSine = document.getElementById("colorPickerSine");
const colorBars = document.getElementById("colorPickerBars");
const inputFile = document.getElementById("input-file");
const voiceSelect = document.getElementById("voice");
let inputPlaying = false;
var song_length_in_seconds = 0;
const cancion1 = "canciones/The Strokes - Reptilia.mp3";
const cancion2 = "canciones/Algo contigo - Rita Payés.mp3";
const cancion3 = "canciones/Lana Del Rey - AW (Audio).mp3";
const cancion4 = "canciones/Waltz No 1, Op 6 Collapse.mp3";
const cancion5 =
  "canciones/Billie Eilish - Getting Older (TIME ABC Performance 2021).mp3";
const cancion6 = "canciones/Taylor Swift - Love Story (Taylors Version).mp3";
const file = document.getElementById("file-name");

let audioElement = document.getElementById("cancion");
let canciones = [cancion1, cancion2, cancion3, cancion4, cancion5, cancion6];
let cancion = canciones[0];
nombre.innerHTML = canciones[0].split("/")[1].split(".")[0];
let i = 0;
let interval;
let offset;
var audioCtx = new AudioContext();
let sourceNode;
const canvasCtx = canvasKey.getContext("2d");
const intendedWidth = document.querySelector(".visualizer").clientWidth;
canvasKey.setAttribute("width", intendedWidth);
let source;
const sliderCurrentTime = document.getElementById("music-player-timeframe");

const filterLow = audioCtx.createBiquadFilter();
filterLow.type = "lowpass";

const filterHigh = audioCtx.createBiquadFilter();
filterHigh.type = "highpass";

const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 2048;
const bufferLength = analyserNode.frequencyBinCount;
WIDTH = canvasKey.width;
HEIGHT = canvasKey.height;

const distortion = audioCtx.createWaveShaper();
const convolver = audioCtx.createConvolver();

const panner = new StereoPannerNode(audioCtx, { pan: 0 });

const amplitudeArray = new Uint8Array(bufferLength);

function playPause() {
  if (play_pause_button.classList.contains("fa-pause")) {
    play_pause_button.classList.replace("fa-pause", "fa-play");
    audioElement.pause();
    cancelAnimationFrame(animationFrameId);
    paused = true;
  } else if (play_pause_button.classList.contains("fa-play")) {
    play_pause_button.classList.replace("fa-play", "fa-pause");
    updateCurrentTime();
    if (paused === false) {
      playSongPrueba();
    } else {
      audioElement.play();
    }
  }
}

// function playPause() {
//   if (play_pause_button.classList.contains("fa-pause")) {
//     play_pause_button.classList.replace("fa-pause", "fa-play");
//     pause();
//   } else if (play_pause_button.classList.contains("fa-play")) {
//     play_pause_button.classList.replace("fa-play", "fa-pause");
//     if (paused === false) {
//       loadSong();
//     } else {
//       resume();
//     }
//   }
// }

let paused = false;
let timePaused = 0;
function pause() {
  paused = true;
  timePaused = sliderCurrentTime.value;
  clearInterval(interval);
  audioCtx.suspend();
}
function resume() {
  audioCtx.resume();
  paused = false;
  interval = setInterval(() => {
    const elapsedTime = audioCtx.currentTime - timePaused;

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    current.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    sliderCurrentTime.value = elapsedTime;
  }, 100);
}
function stopPrueba() {
  if (inputPlaying) {
    source.stop(0);
  }
  current.innerText = "0:00";

  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.parentNode.removeChild(audioElement);

  // Crea un nuevo elemento de audio
  audioElement = document.createElement("audio");
  audioElement.id = "audio";
  audioElement.src = canciones[i];

  // Agrega el nuevo elemento de audio al DOM
  document.body.appendChild(audioElement);
  if (play_pause_button.classList.contains("fa-pause")) {
    play_pause_button.classList.replace("fa-pause", "fa-play");
  }
  msg.textContent = "Audio stopped";
  sliderCurrentTime.value = 0.0;
  pausedAt = null;
  console.log(sliderCurrentTime.value);
}
function stop() {
  audioElement.stop();
  clearInterval(interval);
  sliderCurrentTime.value = 0;
  current.innerText = "0:00";
  if (play_pause_button.classList.contains("fa-pause")) {
    play_pause_button.classList.replace("fa-pause", "fa-play");
  }
  msg.textContent = "Audio stopped";

  pausedAt = null;
}
function playSong(buffer) {
  // create audio source
  source = new AudioBufferSourceNode(audioCtx, {
    buffer: buffer,
    loop: false,
  });

  const gainNode = audioCtx.createGain();
  // gainNode.gain.value = 0;
  gainNode.gain.value = volumeSelector.value;
  volumeSelector.addEventListener(
    "input",
    () => {
      gainNode.gain.value = volumeSelector.value;
    },
    false
  );

  filterLow.frequency.value = lowpassSelector.value;
  lowpassSelector.addEventListener(
    "input",
    () => {
      filterLow.frequency.value = lowpassSelector.value;
    },
    false
  );

  filterHigh.frequency.value = highpassSelector.value;
  highpassSelector.addEventListener(
    "input",
    () => {
      filterHigh.frequency.value = highpassSelector.value;
    },
    false
  );

  pannerSelector.addEventListener(
    "input",
    () => {
      panner.pan.value = pannerSelector.value;
    },
    false
  );

  source
    .connect(gainNode)
    .connect(panner)
    .connect(filterLow)
    .connect(filterHigh)
    .connect(analyserNode)
    .connect(audioCtx.destination);

  source.start(0);

  msg.textContent = "Playing audio...";
  // const startTime = audioCtx.currentTime;

  // const duration = source.buffer.duration;
  // const minutes = Math.floor(duration / 60);
  // const seconds = duration - minutes * 60;
  // const time = minutes + ":" + Math.round(seconds).toString().padStart(2, "0");
  // length.textContent = time;
  // sliderCurrentTime.setAttribute("max", duration);
  // interval = setInterval(() => {
  //   const elapsedTime = audioCtx.currentTime - startTime;

  //   const minutes = Math.floor(elapsedTime / 60);
  //   const seconds = Math.floor(elapsedTime % 60);
  //   current.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  //   sliderCurrentTime.value = elapsedTime;
  // }, 100);
  // setTimeout(function () {
  //   clearInterval(interval);
  // }, duration * 1000);
  visualize();
  //voiceChange();
}
let settingBefore = "";
function voiceChange() {
  distortion.oversample = "4x";

  const songSetting = voiceSelect.value;
  console.log(songSetting);

  if (songSetting == "distortion") {
    distortion.oversample = "2x";
    distortion.curve = makeDistortionCurve(100);
    settingBefore = "distortion";
    filterHigh.connect(distortion).connect(analyserNode);
  } else {
    if (settingBefore == "distortion") {
      filterHigh.disconnect(distortion);
      filterHigh.connect(analyserNode);
    }
  }

  // When convolver is selected it is connected back into the audio path
  if (songSetting == "convolver") {
    findSoundConvolver();
    filterHigh.connect(convolver).connect(analyserNode);

    settingBefore = "convolver";
  } else {
    if (settingBefore == "convolver") {
      convolver.buffer = null;
      filterHigh.disconnect(convolver);
      filterHigh.connect(analyserNode);
    }
  }
}
let soundSource;
function findSoundConvolver() {
  var request = new XMLHttpRequest();

  request.open("GET", "canciones/concert-crowd.mp3", true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    audioCtx.decodeAudioData(request.response, function (buffer) {
      soundSource = audioCtx.createBufferSource();
      convolver.buffer = buffer;
    });
  };
  // request.onprogress = function () {
  //   visualize();
  // };

  request.send();
}

voiceSelect.onchange = function () {
  voiceChange();
};

function loadSong() {
  // load audio file
  msg.textContent = "Loading audio…";
  var request = new XMLHttpRequest();

  request.open("GET", canciones[i], true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    audioCtx.decodeAudioData(request.response, function (buffer) {
      playSong(buffer);
    });
  };
  // request.onprogress = function () {
  //   visualize();
  // };

  request.send();
}

// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
function makeDistortionCurve(amount) {
  let k = typeof amount === "number" ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

inputFile.addEventListener(
  "change",
  function () {
    inputPlaying = true;
    msg.textContent = "Loading audio…";
    var file = inputFile.files[0];
    audioElement.pause();
    audioElement.currentTime = 0;
    var reader = new FileReader();
    reader.onload = function () {
      var audioData = reader.result;

      audioCtx.decodeAudioData(audioData, function (buffer) {
        playSong(buffer);
      });
    };
    play_pause_button.classList.replace("fa-play", "fa-pause");
    reader.readAsArrayBuffer(file);
  },
  false
);

function visualize() {
  const visualSetting = visualSelector.value;

  if (audioCtx.state === "running") {
    if (visualSetting === "sinewave") {
      // We can use Float32Array instead of Uint8Array if we want higher precision
      // const dataArray = new Float32Array(bufferLength);
      function draw() {
        requestAnimationFrame(draw);
        const frequencyArray = new Float32Array(bufferLength);
        // Get the frequency data from the AnalyserNode
        analyserNode.getByteTimeDomainData(amplitudeArray);
        analyserNode.getFloatFrequencyData(frequencyArray);
        // Clear the canvas
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        let x = 0;
        for (let i = 0; i < amplitudeArray.length; i++) {
          const value = amplitudeArray[i] / 256;
          const y = HEIGHT - HEIGHT * value;
          canvasCtx.fillStyle = colorSine.value;

          canvasCtx.fillRect(i, y, 1, 1);
        }
      }

      draw();
    } else if (visualSetting === "frequencybars") {
      const dataArrayAlt = new Uint8Array(bufferLength);
      const frequencyArray = new Float32Array(bufferLength);
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      function draw() {
        analyserNode.getByteFrequencyData(dataArrayAlt);
        analyserNode.getFloatFrequencyData(frequencyArray);

        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArrayAlt[i];

          canvasCtx.fillStyle = colorBars.value;
          canvasCtx.fillRect(
            x,
            HEIGHT - barHeight / 2,
            barWidth,
            barHeight / 2
          );

          x += barWidth + 1;
        }

        // Call the draw function again
        requestAnimationFrame(draw);
      }

      draw();
    }
  }
}
visualSelector.onchange = function () {
  canvasCtx.reset();

  visualize(source);
};

const carousel = document.querySelector(".carousel");
const items = document.querySelectorAll(".item");

var currdeg = 0;

function changeSelect(i) {
  let selected = document.querySelector(".selected");
  selected.classList.remove("selected");
  document.getElementById(i + 1).classList.add("selected");
}
function rotate(e) {
  if (e == "forward") {
    if (i == 5) {
      i = 0;
      nombre.innerHTML = canciones[i].split("/")[1].split(".")[0];
      changeSelect(i);
    } else {
      i++;
      nombre.innerHTML = canciones[i].split("/")[1].split(".")[0];
      changeSelect(i);
    }
    currdeg = currdeg - 60;
  }
  if (e == "backward") {
    if (i == 0) {
      i = 5;
      nombre.innerHTML = canciones[i].split("/")[1].split(".")[0];
      changeSelect(i);
    } else {
      i--;
      nombre.innerHTML = canciones[i].split("/")[1].split(".")[0];
      changeSelect(i);
    }
    currdeg = currdeg + 60;
  }
  const style1 =
    `-webkit-transform: rotateY(` +
    currdeg +
    `deg);
  -moz-transform: rotateY(` +
    currdeg +
    `deg);
  -o-transform: rotateY(` +
    currdeg +
    `deg);
  transform: rotateY(` +
    currdeg +
    `deg);`;

  const style2 =
    `-webkit-transform: rotateY(` +
    -currdeg +
    `deg);
  -moz-transform: rotateY(` +
    -currdeg +
    `deg);
  -o-transform: rotateY(` +
    -currdeg +
    `deg);
  transform: rotateY(` +
    -currdeg +
    `deg);`;
  carousel.style.cssText = style1;
  console.log(sliderCurrentTime.value);

  items.forEach((e) => (e.style.cssText = style2));
  if (play_pause_button.classList.contains("fa-pause")) {
    audioElement.pause();
    audioElement.currentTime = 0;
    // Elimina el elemento de audio existente
    audioElement.parentNode.removeChild(audioElement);

    // Crea un nuevo elemento de audio
    audioElement = document.createElement("audio");
    audioElement.id = "audio";
    audioElement.src = canciones[i];

    // Agrega el nuevo elemento de audio al DOM
    document.body.appendChild(audioElement);
    sourceNode.disconnect();
    canvasCtx.clearRect(0, 0, canvasKey.width, canvasKey.height);
    sliderCurrentTime.value = 0;
    playSongPrueba();
    audioElement.addEventListener("timeupdate", () => {
      const currentTime = audioElement.currentTime;
      const duration = audioElement.duration;
      const progress = (currentTime / duration) * 100;
      sliderCurrentTime.value = progress.toFixed(1);
      console.log(sliderCurrentTime.value);
    });
  } else {
    audioElement.parentNode.removeChild(audioElement);

    // Crea un nuevo elemento de audio
    audioElement = document.createElement("audio");
    audioElement.id = "audio";
    audioElement.src = canciones[i];
    document.body.appendChild(audioElement);

    audioElement.addEventListener("loadedmetadata", () => {
      changeDuration();
    });
  }
}

function playSongPrueba() {
  sourceNode = audioCtx.createMediaElementSource(audioElement);
  const gainNode = audioCtx.createGain();
  // gainNode.gain.value = 0;
  gainNode.gain.value = volumeSelector.value;
  volumeSelector.addEventListener(
    "input",
    () => {
      gainNode.gain.value = volumeSelector.value;
    },
    false
  );

  filterLow.frequency.value = lowpassSelector.value;
  lowpassSelector.addEventListener(
    "input",
    () => {
      filterLow.frequency.value = lowpassSelector.value;
    },
    false
  );

  filterHigh.frequency.value = highpassSelector.value;
  highpassSelector.addEventListener(
    "input",
    () => {
      filterHigh.frequency.value = highpassSelector.value;
    },
    false
  );

  pannerSelector.addEventListener(
    "input",
    () => {
      panner.pan.value = pannerSelector.value;
    },
    false
  );

  sourceNode
    .connect(gainNode)
    .connect(panner)
    .connect(filterLow)
    .connect(filterHigh)
    .connect(analyserNode)
    .connect(audioCtx.destination);
  audioElement.addEventListener("loadedmetadata", function () {
    changeDuration();
  });
  audioElement.play();

  msg.textContent = "Playing audio...";
  visualize();
  //voiceChange();
}

let animationFrameId;

function updateCurrentTime() {
  const currentTime = audioElement.currentTime;
  animationFrameId = requestAnimationFrame(updateCurrentTime);
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  current.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
audioElement.addEventListener("durationchange", () => {
  changeDuration();
});
audioElement.addEventListener("timeupdate", () => {
  const currentTime = audioElement.currentTime;
  const duration = audioElement.duration;
  const progress = (currentTime / duration) * 100;
  sliderCurrentTime.value = progress.toFixed(1);
});

sliderCurrentTime.addEventListener("input", () => {
  const progress = sliderCurrentTime.value;
  const duration = audioElement.duration;
  const currentTime = (progress / 100) * duration;
  audioElement.currentTime = currentTime;
});

function changeDuration() {
  const duration = audioElement.duration;
  console.log(audioElement.duration);
  console.log(audioElement);
  const minutes = Math.floor(duration / 60);
  const seconds = duration - minutes * 60;
  const time = minutes + ":" + Math.round(seconds).toString().padStart(2, "0");
  length.textContent = time;
}

file.addEventListener("change", () => {
  const fileName = file.files[0].name;
  console.log(fileName);
  // Convert size in bytes to kilo bytes

  // Set the text content

  document.querySelector(".file-name").textContent = fileName;
});