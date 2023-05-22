//En este caso voy a dejar solo un color, quizas el clarito para no meter cosas innecesarias
//import Soundfont from "https://cdn.skypack.dev/soundfont-player";

//Ahora voy a probar a ponerle a las notas el sonido a ver si me sale
//Importando esto podemos obtener el sonido de distintos instrumentos

//Selectores
const pedal = document.querySelector("#pedal");
const power = document.querySelector("#power");
const volumeSlider = document.querySelector("#volume-slider");

let volumenActual = 0.5;
volumeSlider.addEventListener("input", () => {
  volumenActual = volumeSlider.value;
});

pedal.addEventListener("click", () => {
  if (pedal.classList.contains("selected")) {
    pedal.classList.remove("selected");
    pedal.style.boxShadow = "1px 1px 2px #0006, 1px 0 0 #fff5 inset";
    // button is already selected
  } else {
    // button is not selected yet
    pedal.style.boxShadow = "0 0 3px #0005 inset";
    pedal.classList.add("selected");
  }
});

power.addEventListener("click", () => {
  if (power.classList.contains("selected")) {
    power.classList.remove("selected");

    power.style.background = "#fdafaf";
    power.style.boxShadow = "none";

    // button is already selected
  } else {
    // button is not selected yet

    power.style.background = "#f90606";
    power.style.boxShadow = "0 0 20px #ff0000";

    power.classList.add("selected");
  }
});

const playingNotes = {};
const teclas = document.querySelectorAll(".key");

teclas.forEach((tecla) =>
  tecla.addEventListener("mousedown", (e) => pulsarTecla(e.target))
);

//funcion que hace el sonido al pulsar la tecla
function pulsarTecla(tecla) {
  const mapaFrecuencias = {
    G3: 195.998,
    Gsos3: 207.652,
    A3: 220.0,
    Asos3: 233.082,
    B3: 246.942,
    C4: 261.626,
    Csos4: 277.183,
    D4: 293.665,
    Dsos4: 311.127,
    E4: 329.628,
    F4: 349.228,
    Fsos4: 369.994,
    G4: 391.995,
    Gsos4: 415.305,
    A4: 440.0,
    Asos4: 466.164,
    B4: 493.883,
    C5: 523.251,
    Csos5: 554.365,
    D5: 587.33,
    Dsos5: 622.254,
    E5: 659.255,
    F5: 698.456,
    Fsos5: 739.989,
    G5: 783.991,
    Gsos5: 830.609,
    A5: 880.0,
    Asos5: 932.328,
    B5: 987.767,
  };
  const nota = tecla.getAttribute("data-note");
  const frecuencia = mapaFrecuencias[nota];
  if (power.classList.contains("selected")) ___generaSonido(frecuencia, tecla);
}

function ___generaSonido(frecuencia, tecla) {
  var ac = new AudioContext();
  var now = ac.currentTime;

  //creamos un nodo para controlar el volumen
  const gainNode = ac.createGain();
  const oscType = document.querySelector(
    'input[name="osc_type"]:checked'
  ).value;

  const pianoOscillator = ac.createOscillator();
  pianoOscillator.type = oscType;
  pianoOscillator.frequency.value = frecuencia;
  //lowpass filter
  // const filterLow = ac.createBiquadFilter();
  // filterLow.frequency.value = freqLow;

  //highpass filter

  pianoOscillator.connect(gainNode);
  // gainNode.connect(filterLow);
  gainNode.connect(ac.destination);

  pianoOscillator.start(now);

  gainNode.gain.setValueAtTime(volumenActual, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3);
  pianoOscillator.stop(now + 4);

  tecla.addEventListener("mouseleave", () => {
    if (!pedal.classList.contains("selected")) {
      pianoOscillator.stop(now + 0.2);
    }
  });
  tecla.addEventListener("mouseup", () => {
    if (!pedal.classList.contains("selected")) {
      pianoOscillator.stop(now + 0.2);
    }
  });
}
