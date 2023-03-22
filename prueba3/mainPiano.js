//En este caso voy a dejar solo un color, quizas el clarito para no meter cosas innecesarias
//import Soundfont from "https://cdn.skypack.dev/soundfont-player";

const COLORMODES = [
  { bgcolor: "#171e27", color: "#909eb4" },
  { bgcolor: "#c0beaf", color: "#4d1210" },
  { bgcolor: "#c02628", color: "#e17d75" },
  { bgcolor: "#becedd", color: "#6b799e" },
];

const colorsButtons = document.querySelectorAll(".colorButtons button");
colorsButtons.forEach((button, index) => {
  button.style.setProperty("--casio-bgcolor", COLORMODES[index].bgcolor);
  button.style.setProperty("--casio-color", COLORMODES[index].color);
  button.addEventListener("click", () => {
    document.body.style.setProperty(
      "--casio-bgcolor",
      COLORMODES[index].bgcolor
    );
    document.body.style.setProperty("--casio-color", COLORMODES[index].color);
  });
});

//Ahora voy a probar a ponerle a las notas el sonido a ver si me sale
//Importando esto podemos obtener el sonido de distintos instrumentos

const playingNotes = {};
let currentInstrument = "piano";
let currentVolume = 1;
const teclas = document.querySelectorAll(".key");
console.log(teclas);
teclas.forEach((tecla) =>
  tecla.addEventListener("click", (e) => pulsarTecla(e.target))
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

  ___generaSonido(frecuencia);
}

const instruments = {
  piano: "acoustic_grand_piano",
  fantasy: "lead_2_sawtooth",
  violin: "violin",
  flute: "flute",
};

// for (const pair of Object.entries(instruments)) {
//   const [key, value] = pair;
//   Soundfont.instrument(ac, value, options).then((data) => {
//     instruments[key] = data;
//   });
// }

function ___generaSonido(frecuencia) {
  var ac = new AudioContext();
  var now = ac.currentTime;
  //creamos un nodo para controlar el volumen
  const gainNode = ac.createGain();
  gainNode.gain.value = 1;

  const filterNode = ac.createBiquadFilter();
  filterNode.type = "lowpass";
  filterNode.frequency.value = 1000;

  const pianoOscillator = ac.createOscillator();
  pianoOscillator.type = "sine";
  pianoOscillator.frequency.value = frecuencia;
  pianoOscillator.start(now);
  pianoOscillator.connect(gainNode);
  gainNode.connect(ac.destination);

  gainNode.gain.setValueAtTime(1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1);
  pianoOscillator.stop(now + 1);
}
