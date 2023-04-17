const msg = document.querySelector("output");
const startBtn = document.querySelector("#start_button");
const stopBtn = document.querySelector("#stop_button");
const canvasKey = document.querySelector("#canvas");
const visualSelector = document.querySelector("#visual");
let drawVisual;

console.log(startBtn);
// When the _Start_ button is clicked, set up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas.
startBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startBtn.disabled = true;
  stopBtn.disabled = false;

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
      const canvasContext = canvasKey.getContext("2d");
      function visualize() {
        WIDTH = canvasKey.width;
        HEIGHT = canvasKey.height;
        const amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        const visualSetting = visualSelector.value;
        analyserNode.getByteTimeDomainData(amplitudeArray);

        if (audioContext.state === "running") {
          if (visualSetting === "sinewave") {
            // We can use Float32Array instead of Uint8Array if we want higher precision
            // const dataArray = new Float32Array(bufferLength);
            const drawAlt = function () {
              drawVisual = requestAnimationFrame(() => {
                // Get the canvas 2d context

                // Clear the canvas
                canvasContext.clearRect(
                  0,
                  0,
                  canvasKey.width,
                  canvasKey.height
                );

                // Draw the amplitude inside the canvas
                for (let i = 0; i < amplitudeArray.length; i++) {
                  const value = amplitudeArray[i] / 256;
                  const y = canvasKey.height - canvasKey.height * value;
                  canvasContext.fillStyle = "white";
                  canvasContext.fillRect(i, y, 1, 1);
                }
              });
            };

            drawAlt();

            // Set up the event handler to stop playing the audio
            stopBtn.addEventListener("click", (e) => {
              e.preventDefault();
              canvasContext.clearRect(0, 0, canvasKey.width, canvasKey.height);
              startBtn.disabled = false;
              stopBtn.disabled = true;
              sourceNode.stop(0);
              window.cancelAnimationFrame(drawVisual);
              msg.textContent = "Audio stopped.";
            });
          } else if (visualSetting === "frequencybars") {
            //console.log("freqiuencoias");
            analyserNode.fftSize = 256;
            const bufferLengthAlt = analyserNode.frequencyBinCount;
            //console.log(bufferLengthAlt);

            // See comment above for Float32Array()
            const dataArrayAlt = new Uint8Array(bufferLengthAlt);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            const drawAlt = function () {
              drawVisual = requestAnimationFrame(drawAlt);

              analyserNode.getByteFrequencyData(dataArrayAlt);

              canvasCtx.fillStyle = "rgb(0, 0, 0)";
              canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

              const barWidth = (WIDTH / bufferLengthAlt) * 2.5;
              let barHeight;
              let x = 0;

              for (let i = 0; i < bufferLengthAlt; i++) {
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
            };

            drawAlt();

            // Set up the event handler to stop playing the audio
            stopBtn.addEventListener("click", (e) => {
              e.preventDefault();
              startBtn.disabled = false;
              stopBtn.disabled = true;
              sourceNode.stop(0);
              window.cancelAnimationFrame(drawVisual);
              msg.textContent = "Audio stopped.";
              refresh();
            });
          }
        }
      }
      visualSelector.onchange = function () {
        canvasContext.reset();
        window.cancelAnimationFrame(drawVisual);
        visualize();
      };
    });

  // Create the node that controls the volume.
  const gainNode = new GainNode(audioContext);

  // const volumeControl = document.querySelector("#osc-portamento");
  // volumeControl.addEventListener(
  //   "input",
  //   () => {
  //     gainNode.gain.value = volumeControl.value;
  //   },
  //   false
  // );
});
