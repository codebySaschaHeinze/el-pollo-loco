let canvas;
let world;
let keyboard = new Keyboard();

let gameVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("gameVolume") ?? "1")));

function init() {
  canvas = document.getElementById("canvas");
  keyboard = new Keyboard();
  world = new World(canvas, keyboard);

  world.paused = true;
}

document.addEventListener("DOMContentLoaded", () => {
  const ovStart = document.getElementById("overlay-1");
  const ovSettings = document.getElementById("overlay-settings");
  const btnBack = document.getElementById("btn-back-start");
  const btnStart = document.getElementById("btn-start");
  function backToStartHardReset() {
    location.reload();
  }
  const btnFab = document.getElementById("btn-settings-fab");
  const btnClose = document.getElementById("btn-close-settings");
  const btnResume = document.getElementById("btn-resume");
  const resumeRow = document.getElementById("resume-row");
  const btnBackStart = document.getElementById("btn-back-start");
  const backRow = document.getElementById("back-row");
  const slider = document.getElementById("volume-slider");
  const lbl = document.getElementById("volume-value");

  btnBack?.addEventListener("click", backToStartHardReset);

  if (slider && lbl) {
    const setVol = (pct) => {
      const p = Math.min(100, Math.max(0, Number(pct) || 0));
      slider.value = p;
      lbl.textContent = `${p}%`;
      gameVolume = p / 100;
      localStorage.setItem("gameVolume", String(gameVolume));
    };
    setVol(Math.round(gameVolume * 100));
    slider.addEventListener("input", (e) => setVol(e.target.value));
  }

  const isInStart = () => ovStart && !ovStart.classList.contains("hidden");

  function startGame() {
    ovStart.classList.add("hidden");
    if (world) world.paused = false;
  }

  function openSettings() {
    const inStart = isInStart();
    if (resumeRow) resumeRow.classList.toggle("hidden", inStart);
    if (backRow) backRow.classList.toggle("hidden", inStart);
    ovSettings.classList.remove("hidden");
    if (world && !inStart) world.paused = true;
  }

  function closeSettings() {
    ovSettings.classList.add("hidden");
    if (world && !isInStart()) world.paused = false;
  }

  function backToStart() {
    ovSettings.classList.add("hidden");
    ovStart.classList.remove("hidden");
    if (world) world.paused = true;
  }

  btnStart?.addEventListener("click", startGame);
  btnFab?.addEventListener("click", openSettings);
  btnClose?.addEventListener("click", closeSettings);
  btnResume?.addEventListener("click", closeSettings);
  btnBackStart?.addEventListener("click", backToStart);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ovSettings.classList.contains("hidden")) {
      closeSettings();
    }
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") keyboard.LEFT = true;
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") keyboard.UP = true;
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") keyboard.RIGHT = true;
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") keyboard.DOWN = true;
  if (event.key === " ") keyboard.SPACE = true;
});
window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") keyboard.LEFT = false;
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") keyboard.UP = false;
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") keyboard.RIGHT = false;
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") keyboard.DOWN = false;
  if (event.key === " ") keyboard.SPACE = false;
});

function showResult(type) {
  const ov = document.getElementById("overlay-result");
  const img = document.getElementById("result-img");

  const WIN_IMG = "assets/imgs/You_won_you_lost/won.png";
  const LOSE_IMG = "assets/imgs/You_won_you_lost/lost.png";

  img.src = type === "win" ? WIN_IMG : LOSE_IMG;

  if (window.world) world.paused = true;

  ov.classList.remove("hidden");
  void ov.offsetWidth;
  ov.classList.add("show");

  setTimeout(() => location.reload(), 2000);
}
