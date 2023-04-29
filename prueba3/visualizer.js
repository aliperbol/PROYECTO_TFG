const msg = document.querySelector("output");
const startBtn = document.querySelector("#start_button");
const stopBtn = document.querySelector("#stop_button");
const canvasKey = document.querySelector("#canvas");
const visualSelector = document.querySelector("#visual");
var play_pause_button = document.getElementById("play-pause-button");
var song_length_in_seconds = 0;
const cancion1 = "canciones/The Strokes - Reptilia.mp3";
const cancion2 = "canciones/Algo contigo.mp3";
const cancion3 = "canciones/Lana Del Rey - AW (Audio).mp3";
const cancion4 = "canciones/Waltz No. 1, Op. 6 Collapse.mp3";
const cancion5 =
  "canciones/Billie Eilish - Getting Older (TIME ABC Performance 2021).mp3";
const cancion6 =
  "canciones/FIFTY FIFTY (피프티피프티) - Cupid (TwinVer.) Official Lyric Video.mp3";
let canciones = [cancion1, cancion2, cancion3, cancion4, cancion5, cancion6];
let cancion = canciones[0];
let i = 0;
var audioCtx = new AudioContext();
const canvasCtx = canvasKey.getContext("2d");
const intendedWidth = document.querySelector(".visualizer").clientWidth;
canvasKey.setAttribute("width", intendedWidth);
let source;
function playPause() {
  if (play_pause_button.classList.contains("fa-stop")) {
    play_pause_button.classList.replace("fa-stop", "fa-play");
    source.stop();
  } else if (play_pause_button.classList.contains("fa-play")) {
    play_pause_button.classList.replace("fa-play", "fa-stop");
    playSong();
  }
}
function playSong() {
  // load audio file
  msg.textContent = "Loading audio…";
  var request = new XMLHttpRequest();

  request.open("GET", canciones[i], true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    audioCtx.decodeAudioData(request.response, function (buffer) {
      // create audio source
      source = new AudioBufferSourceNode(audioCtx, {
        buffer: buffer,
        loop: false,
      });
      const startTime = audioCtx.currentTime;
      source.connect(audioCtx.destination);

      // play audio
      source.start(0);
      msg.textContent = "Playing audio...";
      const sliderCurrentTime = document.getElementById(
        "music-player-timeframe"
      );
      setInterval(() => {
        const elapsedTime = audioCtx.currentTime - startTime;

        sliderCurrentTime.value = elapsedTime;
      }, 100);
      visualize(source);
    });
  };
  // request.onprogress = function () {
  //   visualize();
  // };

  request.send();
}
// When the _Start_ button is clicked, set up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas.
startBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  playSong();
});
//});
stopBtn.addEventListener("click", (e) => {
  e.preventDefault();

  canvasCtx.clearRect(0, 0, canvasKey.width, canvasKey.height);

  startBtn.disabled = false;
  stopBtn.disabled = true;
  source.stop(0);
  window.cancelAnimationFrame(drawVisual);
  msg.textContent = "Audio stopped.";
});
const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 2048;
const bufferLength = analyserNode.frequencyBinCount;
WIDTH = canvasKey.width;
HEIGHT = canvasKey.height;
const amplitudeArray = new Uint8Array(bufferLength);

function visualize(source) {
  source.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);
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
          const y = canvasKey.height - canvasKey.height * value;
          canvasCtx.fillStyle = "white";
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

          canvasCtx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
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

let selected = document.querySelector(".selected");
items.forEach((item) => {
  item.addEventListener("click", () => {
    console.log(selected.id, item.id);
    if (selected.id < item.id) {
      if (selected.id == 1 && item.id == 6) {
        item.data = "p";
        rotate(item);
      } else {
        item.data = "n";
        rotate(item);
      }
    } else if (selected.id > item.id) {
      if (selected.id == 6 && item.id == 1) {
        item.data = "n";
        rotate(item);
      } else {
        item.data = "p";
        rotate(item);
      }
    }
    if (selected) {
      selected.classList.remove("selected");
    }
    selected = item;
    selected.classList.add("selected");
    cancion = canciones[parseInt(item.id) - 1];
    if (play_pause_button.classList.contains("fa-pause")) {
      audioCtx.resume();
      canvasCtx.clearRect(0, 0, canvasKey.width, canvasKey.height);
      source.stop(0);

      playSong();
    }

    // Do something with the selected item
  });
});

function rotate(e) {
  if (e == "forward") {
    if (i == 5) {
      i = 0;
    } else {
      i++;
    }
    currdeg = currdeg - 60;
  }
  if (e == "backward") {
    if (i == 0) {
      i = 5;
    } else {
      i--;
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

  items.forEach((e) => (e.style.cssText = style2));
  if (play_pause_button.classList.contains("fa-stop")) {
    audioCtx.resume();
    canvasCtx.clearRect(0, 0, canvasKey.width, canvasKey.height);
    source.stop(0);

    playSong();
  }
}

function playSong2() {
  // A user interaction happened we can create the audioContext
  const audioContext = new AudioContext();

  const canvasCtx = canvasKey.getContext("2d");
  const intendedWidth = document.querySelector(".visualizer").clientWidth;
  canvasKey.setAttribute("width", intendedWidth);

  // Load the audio the first time through, otherwise play it from the buffer
  msg.textContent = "Loading audio…";

  fetch("canciones/The Strokes - Reptilia.mp3")
    .then((response) => response.arrayBuffer())
    .then((downloadedBuffer) => audioContext.decodeAudioData(downloadedBuffer))
    .then((decodedBuffer) => {
      msg.textContent = "Configuring audio stack…";

      // Set up the AudioBufferSourceNode
      const sourceNode = new AudioBufferSourceNode(audioContext, {
        buffer: decodedBuffer,
        loop: true,
      });

      // Set up the audio analyser and the javascript node
      const analyserNode = new AnalyserNode(audioContext);
      const javascriptNode = audioContext.createScriptProcessor(1024, 1, 1);

      // Connect the nodes together

      sourceNode.connect(audioContext.destination);
      sourceNode.connect(analyserNode);
      analyserNode.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      // Play the audio
      msg.textContent = "Audio playing…";
      sourceNode.start(0); // Play the sound now
      javascriptNode.onaudioprocess = () => {
        visualize();
      };
    });
}
//Set up the event handler to stop playing the audio
