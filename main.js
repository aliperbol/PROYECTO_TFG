const msg = document.querySelector("output");
const startBtn = document.querySelector("#start_button");
const stopBtn = document.querySelector("#stop_button");
const canvasElt = document.querySelector("#canvas");

// When the _Start_ button is clicked, set up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas.
startBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startBtn.disabled = true;

  // A user interaction happened we can create the audioContext
  const audioContext = new AudioContext();

  // Load the audio the first time through, otherwise play it from the buffer
  msg.textContent = "Loading audio…";

  fetch("canciones\The Strokes - Reptilia.mp3")
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

      // Set up the event handler that is triggered every time enough samples have been collected
      // then trigger the audio analysis and draw the results
      javascriptNode.onaudioprocess = () => {
        // Read the frequency values
        const amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

        // Get the time domain data for this sample
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // Draw the display when the audio is playing
        if (audioContext.state === "running") {
          // Draw the time domain in the canvas
          requestAnimationFrame(() => {
            // Get the canvas 2d context
            const canvasContext = canvasElt.getContext("2d");

            // Clear the canvas
            canvasContext.clearRect(0, 0, canvasElt.width, canvasElt.height);

            // Draw the amplitude inside the canvas
            for (let i = 0; i < amplitudeArray.length; i++) {
              const value = amplitudeArray[i] / 256;
              const y = canvasElt.height - canvasElt.height * value;
              canvasContext.fillStyle = "white";
              canvasContext.fillRect(i, y, 1, 1);
            }
          });
        }
      };

      // Set up the event handler to stop playing the audio
      stopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        sourceNode.stop(0);
        msg.textContent = "Audio stopped.";
      });
      stopBtn.disabled = false;
    })
    .catch((e) => {
      console.error(`Error: ${e}`);
    });
});
