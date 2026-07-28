const letters = [
  ["A", "a", "эй"],
  ["B", "b", "би"],
  ["C", "c", "си"],
  ["D", "d", "ди"],
  ["E", "e", "и"],
  ["F", "f", "эф"],
  ["G", "g", "джи"],
  ["H", "h", "эйч"],
  ["I", "i", "ай"],
  ["J", "j", "джей"],
  ["K", "k", "кей"],
  ["L", "l", "эл"],
  ["M", "m", "эм"],
  ["N", "n", "эн"],
  ["O", "o", "оу"],
  ["P", "p", "пи"],
  ["Q", "q", "кью"],
  ["R", "r", "ар"],
  ["S", "s", "эс"],
  ["T", "t", "ти"],
  ["U", "u", "ю"],
  ["V", "v", "ви"],
  ["W", "w", "дабл-ю"],
  ["X", "x", "экс"],
  ["Y", "y", "уай"],
  ["Z", "z", "зи"]
];

const colors = [
  "#ffd166",
  "#8ecae6",
  "#b8e986",
  "#ff9f9c",
  "#cdb4db",
  "#90dbf4",
  "#f9c74f",
  "#a3d9a5",
  "#f7a8a8",
  "#bde0fe",
  "#ffc8dd",
  "#caffbf",
  "#fdffb6"
];

const letterSounds = {
  A: "ay",
  B: "bee",
  C: "see",
  D: "dee",
  E: "eee",
  F: "ef",
  G: "gee",
  H: "aitch",
  I: "eye",
  J: "jay",
  K: "kay",
  L: "ell",
  M: "em",
  N: "en",
  O: "oh",
  P: "pee",
  Q: "queue",
  R: "are",
  S: "ess",
  T: "tee",
  U: "you",
  V: "vee",
  W: "double you",
  X: "ex",
  Y: "why",
  Z: "zee"
};

const alphabetEl = document.querySelector("#alphabet");
const playAllButton = document.querySelector("#play-all");
const stopButton = document.querySelector("#stop");

let voices = [];
let activeCard = null;
let isPlayingAll = false;
let playAllIndex = 0;

function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}

function getEnglishVoice() {
  return (
    voices.find((voice) => voice.lang === "en-US") ||
    voices.find((voice) => voice.lang === "en-GB") ||
    voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en")) ||
    null
  );
}

function setActiveCard(card) {
  if (activeCard) {
    activeCard.classList.remove("active");
  }

  activeCard = card;

  if (activeCard) {
    activeCard.classList.add("active");
  }
}

function stopSpeech() {
  isPlayingAll = false;
  playAllIndex = 0;
  window.speechSynthesis.cancel();
  setActiveCard(null);
}

function speakLetter(letter, card, onDone, cancelCurrent = true) {
  if (cancelCurrent) {
    window.speechSynthesis.cancel();
  }
  setActiveCard(card);

  const utterance = new SpeechSynthesisUtterance(letterSounds[letter] || letter);
  utterance.lang = "en-US";
  utterance.rate = 0.56;
  utterance.pitch = 1;
  utterance.volume = 1;

  const englishVoice = getEnglishVoice();
  if (englishVoice) {
    utterance.voice = englishVoice;
    utterance.lang = englishVoice.lang;
  }

  utterance.onend = () => {
    if (!isPlayingAll) {
      setActiveCard(null);
    }
    if (onDone) {
      window.setTimeout(onDone, 140);
    }
  };

  utterance.onerror = () => {
    setActiveCard(null);
    isPlayingAll = false;
    if (onDone) {
      onDone();
    }
  };

  window.speechSynthesis.speak(utterance);
}

function playNextLetter() {
  if (!isPlayingAll) {
    return;
  }

  if (playAllIndex >= letters.length) {
    isPlayingAll = false;
    playAllIndex = 0;
    setActiveCard(null);
    return;
  }

  const letter = letters[playAllIndex][0];
  const card = alphabetEl.querySelector(`[data-letter="${letter}"]`);
  playAllIndex += 1;

  speakLetter(letter, card, playNextLetter, false);
}

function playAllLetters() {
  window.speechSynthesis.cancel();
  isPlayingAll = true;
  playAllIndex = 0;
  playNextLetter();
}

function createCard([upper, lower, hint], index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "letter-card";
  card.dataset.letter = upper;
  card.style.backgroundColor = colors[index % colors.length];
  card.setAttribute("aria-label", `${upper}, ${hint}`);

  card.innerHTML = `
    <span class="upper">${upper}</span>
    <span class="lower">${lower}</span>
    <span class="hint">${hint}</span>
  `;

  card.addEventListener("click", () => {
    isPlayingAll = false;
    playAllIndex = 0;
    speakLetter(upper, card);
  });

  return card;
}

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  letters.forEach((letter, index) => {
    alphabetEl.appendChild(createCard(letter, index));
  });

  playAllButton.addEventListener("click", playAllLetters);
  stopButton.addEventListener("click", stopSpeech);
} else {
  letters.forEach((letter, index) => {
    alphabetEl.appendChild(createCard(letter, index));
  });
  playAllButton.disabled = true;
  stopButton.disabled = true;
}
