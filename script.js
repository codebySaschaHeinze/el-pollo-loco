let canvas;
let world;
let keyboard = new Keyboard();

/* =======================
   Lautstärke / Mute
======================= */
window.gameMuted = localStorage.getItem("gameMuted") === "1";
window.gameVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("gameVolume") ?? "1")));
window.getEffectiveVolume = () => (window.gameMuted ? 0 : window.gameVolume);

function applyVolumeAll() {
  const vol = window.getEffectiveVolume();
  if (window.SFX) Object.values(window.SFX).forEach((a) => a && (a.volume = vol));
  if (window.BGM) window.BGM.volume = vol; // <<< BGM mitnehmen
}

function updateMuteUI() {
  const icon = document.getElementById("icon-mute");
  if (!icon) return;
  icon.src = window.gameMuted ? "assets/buttons/mute-on.png" : "assets/buttons/mute-off.png";
  icon.alt = window.gameMuted ? "Unmute" : "Mute";
}

/* =======================
   Audio-Helfer / SFX / BGM
======================= */
function makeSfx(src, loop = false) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = loop;
  a.volume = window.getEffectiveVolume();
  return a;
}

window.SFX = window.SFX || {};
window.SFX.step = makeSfx("audio/footstep.wav", true);
window.SFX.bottleBreak = makeSfx("audio/broken-bottle.wav");
window.SFX.chickenHit = makeSfx("audio/chicken-noise.wav");
window.SFX.bossHurt = makeSfx("audio/big-chicken-noise.wav");
window.SFX.hurt = makeSfx("audio/hurt.wav");
window.SFX.bottlePickup = makeSfx("audio/collect-bottle.wav");
window.SFX.coinPickup = makeSfx("audio/collect-coin.wav");
window.SFX.jump = makeSfx("audio/jump.wav");

window.playSfx = function (name) {
  const a = window.SFX?.[name];
  if (!a) return;
  a.volume = window.getEffectiveVolume();
  try {
    a.currentTime = 0;
    a.play();
  } catch (_) {}
};

function makeBgm(src) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = true;
  a.volume = window.getEffectiveVolume();
  return a;
}
window.BGM = null;

function setGameVolumeFromSlider(pct) {
  const v = Math.min(1, Math.max(0, (Number(pct) || 0) / 100));
  window.gameVolume = v;
  localStorage.setItem("gameVolume", String(v));
  applyVolumeAll();
}

/* =======================
   Sichtbarkeits-Helfer (global)
======================= */
function isStartVisible() {
  const ov = document.getElementById("overlay-1");
  return !!(ov && !ov.classList.contains("hidden"));
}
function isSettingsVisible() {
  const ov = document.getElementById("overlay-settings");
  return !!(ov && !ov.classList.contains("hidden"));
}
function isTouch() {
  return matchMedia("(pointer: coarse)").matches;
}
function isLandscape() {
  return matchMedia("(orientation: landscape)").matches;
}

/* Touch-Buttons nur zeigen, wenn:
   - Touch-Gerät
   - Landscape
   - nicht Start-Overlay, nicht Settings-Overlay
*/
function updateTouchButtonsVisibility() {
  const overlayButtons = document.getElementById("overlay-buttons");
  if (!overlayButtons) return;
  const show = isTouch() && isLandscape() && !isStartVisible() && !isSettingsVisible();
  overlayButtons.classList.toggle("hidden", !show);
}

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
  const btnFab = document.getElementById("btn-settings-fab");
  const btnClose = document.getElementById("btn-close-settings");
  const btnResume = document.getElementById("btn-resume");
  const resumeRow = document.getElementById("resume-row");
  const btnBackStart = document.getElementById("btn-back-start");
  const backRow = document.getElementById("back-row");
  const slider = document.getElementById("volume-slider");
  const lbl = document.getElementById("volume-value");
  const btnMute = document.getElementById("btn-mute");

  updateMuteUI();
  applyVolumeAll();

  btnMute?.addEventListener("click", () => {
    window.gameMuted = !window.gameMuted;
    localStorage.setItem("gameMuted", window.gameMuted ? "1" : "0");
    updateMuteUI();
    applyVolumeAll();
    window.world?.character?.pauseStep?.();
  });

  if (slider && lbl) {
    const startPct = Math.round((window.gameVolume ?? 1) * 100);
    slider.value = String(startPct);
    lbl.textContent = `${startPct}%`;
    setGameVolumeFromSlider(startPct);

    slider.addEventListener("input", (e) => {
      const pct = e.target.value;
      lbl.textContent = `${pct}%`;
      setGameVolumeFromSlider(pct);
    });
  }

  function startGame() {
    ovStart.classList.add("hidden");

    if (!window.BGM) window.BGM = makeBgm("audio/bg-music.wav");
    window.BGM.volume = window.getEffectiveVolume();
    window.BGM.play().catch(() => {});

    if (world) world.paused = false;
    updateTouchButtonsVisibility();
  }

  function openSettings() {
    const inStart = isStartVisible();
    if (resumeRow) resumeRow.classList.toggle("hidden", inStart);
    if (backRow) backRow.classList.toggle("hidden", inStart);
    ovSettings.classList.remove("hidden");
    if (world && !inStart) world.paused = true;
    updateTouchButtonsVisibility();
  }

  function closeSettings() {
    ovSettings.classList.add("hidden");
    if (world && !isStartVisible()) world.paused = false;
    updateTouchButtonsVisibility();
  }

  function backToStart() {
    ovSettings.classList.add("hidden");
    ovStart.classList.remove("hidden");
    if (world) world.paused = true;
    updateTouchButtonsVisibility();
  }

  function backToStartHardReset() {
    location.reload();
  }

  btnBack?.addEventListener("click", backToStartHardReset);
  btnStart?.addEventListener("click", startGame);
  btnFab?.addEventListener("click", openSettings);
  btnFab?.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      openSettings();
    },
    { passive: false }
  );
  btnClose?.addEventListener("click", closeSettings);
  btnResume?.addEventListener("click", closeSettings);
  btnBackStart?.addEventListener("click", backToStart);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ovSettings.classList.contains("hidden")) {
      closeSettings();
    }
  });

  const btnLeft = document.getElementById("button-left");
  const btnRight = document.getElementById("button-right");
  const btnJump = document.getElementById("button-jump");
  const btnThrow = document.getElementById("button-throw");

  function bindHold(el, flag) {
    if (!el) return;
    const down = (e) => {
      e.preventDefault();
      keyboard[flag] = true;
    };
    const up = (e) => {
      e.preventDefault();
      keyboard[flag] = false;
    };

    el.addEventListener("pointerdown", down, { passive: false });
    el.addEventListener("pointerup", up, { passive: false });
    el.addEventListener("pointercancel", up, { passive: false });
    el.addEventListener("mouseleave", up, { passive: false });
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up, { passive: false });
    el.addEventListener("touchcancel", up, { passive: false });
    el.addEventListener("mousedown", down);
    el.addEventListener("mouseup", up);
  }

  bindHold(btnLeft, "LEFT");
  bindHold(btnRight, "RIGHT");
  bindHold(btnJump, "UP");
  bindHold(btnThrow, "SPACE");
  updateTouchButtonsVisibility();
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

function syncPauseToOrientation() {
  if (!window.world) return;
  if (isTouch() && !isLandscape()) {
    world.paused = true;
  }
}
window.addEventListener("resize", () => {
  syncPauseToOrientation();
  updateTouchButtonsVisibility();
});
window.addEventListener("orientationchange", () => {
  syncPauseToOrientation();
  updateTouchButtonsVisibility();
});
document.addEventListener("DOMContentLoaded", () => {
  syncPauseToOrientation();
  updateTouchButtonsVisibility();
});
