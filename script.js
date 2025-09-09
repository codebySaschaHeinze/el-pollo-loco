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

function wireMenuOverlay() {
  const overlay = document.getElementById("overlay-1");
  const btnStart = document.getElementById("btn-start");
  const slider = document.getElementById("volume-slider");
  const lbl = document.getElementById("volume-value");

  
  slider.value = Math.round(gameVolume * 100);
  lbl.textContent = `${slider.value}%`;

  btnStart.addEventListener("click", () => {
    overlay.classList.add("hidden");
    startGame();
  });

  slider.addEventListener("input", () => {
    const pct = Number(slider.value);
    lbl.textContent = `${pct}%`;
    gameVolume = pct / 100;
    localStorage.setItem("gameVolume", String(gameVolume));
    
  });
}

function startGame() {
  world = new World(canvas, keyboard);

}

function wireSettingsOverlay(){
  const btnSettings   = document.getElementById('btn-settings');
  const overlaySett   = document.getElementById('overlay-settings');
  const btnBackStart  = document.getElementById('btn-back-start');
  const btnResume     = document.getElementById('btn-resume');

  btnSettings.addEventListener('click', () => {
   
    updateSettingsOverlayUI();

    
    if (!isInStartScreen()) pauseGame();

    overlaySett.classList.remove('hidden');
  });

  if (btnResume){
    btnResume.addEventListener('click', () => {
      overlaySett.classList.add('hidden');
      resumeGame();
    });
  }

  if (btnBackStart){
    btnBackStart.addEventListener('click', () => {
     
      location.reload();
    });
  }
}

function isInStartScreen(){
  const ov = document.getElementById('overlay-1');
  
  return !!(ov && !ov.classList.contains('hidden'));
}

function updateSettingsOverlayUI(){
  const inMenu = isInStartScreen();
  
  const btnResume    = document.getElementById('btn-resume');
  const btnBackStart = document.getElementById('btn-back-start');

  if (btnResume)    btnResume.classList.toggle('hidden', inMenu);
  if (btnBackStart) btnBackStart.classList.toggle('hidden', inMenu);
}


document.addEventListener('DOMContentLoaded', wireSettingsOverlay);

function pauseGame(){
  if (world) world.paused = true;    
}

function resumeGame(){
  if (world) world.paused = false;
}

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

function init() {
  canvas = document.getElementById("canvas");
  keyboard = new Keyboard();
  world = new World(canvas, keyboard);
  world.paused = true; // Spiel ist pausiert, bis man auf Start klickt
}

// Wiring (einmalig am Ende von script.js)
document.addEventListener('DOMContentLoaded', () => {
  const startOv    = document.getElementById('overlay-1');
  const settingsOv = document.getElementById('overlay-settings');
  const fab        = document.getElementById('btn-settings-fab');
  const btnStart   = document.getElementById('btn-start');
  const btnBack    = document.getElementById('btn-back-start');
  const btnResume  = document.getElementById('btn-resume');
  const btnClose   = document.getElementById('btn-close-settings');
  const resumeRow  = document.getElementById('resume-row');

  function openSettings() {
    const inStart = !startOv.classList.contains('hidden');
    if (resumeRow) resumeRow.classList.toggle('hidden', inStart);
    settingsOv.classList.remove('hidden');
    if (window.world && !inStart) world.paused = true;
  }
  function closeSettings() {
    settingsOv.classList.add('hidden');
    if (window.world && startOv.classList.contains('hidden')) world.paused = false;
  }
  function backToStart() {
    settingsOv.classList.add('hidden');
    startOv.classList.remove('hidden');
    if (window.world) world.paused = true;
  }
  function startGame() {
    startOv.classList.add('hidden');
    if (window.world) world.paused = false;
  }

  fab?.addEventListener('click', openSettings);
  btnClose?.addEventListener('click', closeSettings);
  btnResume?.addEventListener('click', closeSettings);
  btnBack?.addEventListener('click', backToStart);
  btnStart?.addEventListener('click', startGame);

  // Volume wiring
  const vol = document.getElementById('volume-slider');
  const volVal = document.getElementById('volume-value');
  if (vol && volVal) {
    const setVolume = v => {
      const p = Math.min(100, Math.max(0, Number(v) || 0));
      volVal.textContent = `${p}%`;
      window.gameVolume = p / 100;
    };
    vol.value = vol.value || 100;
    setVolume(vol.value);
    vol.addEventListener('input', e => setVolume(e.target.value));
  }
});
