/**
 * @file Bootstraps the game, handles audio (mute/volume), overlays,
 * touch controls and orientation. Exposes helpers on window.
 */

/** @type {HTMLCanvasElement|null} */ let canvas = null;
/** @type {World|null}            */ let world = null;
/** @type {Keyboard}              */ let keyboard = new Keyboard();

/** Small DOM helper (by id) */
const $ = (id) => /** @type {HTMLElement|null} */ (document.getElementById(id));

/** Cache for frequent nodes (filled on DOMContentLoaded) */
let DOM = /** @type {Record<string, HTMLElement|null>} */ ({});

/* -------------------- AUDIO -------------------- */

/** @global {boolean} persisted */
window.gameMuted = localStorage.getItem("gameMuted") === "1";
/** @global {number}  persisted (0..1) */
window.gameVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("gameVolume") ?? "1")));

/**
 * Effective master volume [0..1], respecting mute.
 * @returns {number}
 */
window.getEffectiveVolume = () => (window.gameMuted ? 0 : window.gameVolume);

/**
 * Apply effective volume to all registered SFX/BGM.
 * @returns {void}
 */
function applyVolumeAll() {
  const v = window.getEffectiveVolume();
  if (window.SFX) Object.values(window.SFX).forEach((a) => a && (a.volume = v));
  if (window.BGM) window.BGM.volume = v;
}

/**
 * Update the mute icon.
 * @returns {void}
 */
function updateMuteUI() {
  const icon = /** @type {HTMLImageElement|null} */ ($("icon-mute"));
  if (!icon) return;
  icon.src = window.gameMuted ? "assets/buttons/mute-on.png" : "assets/buttons/mute-off.png";
  icon.alt = window.gameMuted ? "Unmute" : "Mute";
}

/**
 * Create an SFX audio element.
 * @param {string} src
 * @param {boolean} [loop=false]
 * @returns {HTMLAudioElement}
 */
function makeSfx(src, loop = false) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = loop;
  a.volume = window.getEffectiveVolume();
  return a;
}

/** Global SFX registry (created early so applyVolumeAll() can run safely) */
window.SFX = window.SFX || {
  step: makeSfx("audio/footstep.wav", true),
  bottleBreak: makeSfx("audio/broken-bottle.wav"),
  chickenHit: makeSfx("audio/chicken-noise.wav"),
  bossHurt: makeSfx("audio/big-chicken-noise.wav"),
  hurt: makeSfx("audio/hurt.wav"),
  bottlePickup: makeSfx("audio/collect-bottle.wav"),
  coinPickup: makeSfx("audio/collect-coin.wav"),
  jump: makeSfx("audio/jump.wav"),
};

/**
 * Play an SFX by name (respects mute/volume).
 * @param {string} name
 * @returns {void}
 */
window.playSfx = function (name) {
  const a = window.SFX?.[name];
  if (!a) return;
  a.volume = window.getEffectiveVolume();
  try {
    a.currentTime = 0;
    a.play();
  } catch {}
};

/** @global {HTMLAudioElement|null} background music */
window.BGM = null;

/**
 * Set master volume from 0..100 slider and apply globally.
 * @param {number|string} pct
 * @returns {void}
 */
function setGameVolumeFromSlider(pct) {
  const v = Math.min(1, Math.max(0, (Number(pct) || 0) / 100));
  window.gameVolume = v;
  localStorage.setItem("gameVolume", String(v));
  applyVolumeAll();
}

/** Ensure BGM exists & plays. */
function startBGM() {
  if (!window.BGM) {
    const a = new Audio("audio/bg-music.wav");
    a.preload = "auto";
    a.loop = true;
    a.volume = window.getEffectiveVolume();
    window.BGM = a;
  }
  window.BGM.volume = window.getEffectiveVolume();
  window.BGM.play().catch(() => {});
}

/* -------------------- WORLD LIFECYCLE -------------------- */

/**
 * Initialize canvas, keyboard, and a paused world.
 * (Aufruf via body onload="init()")
 * @returns {void}
 */
function init() {
  canvas = /** @type {HTMLCanvasElement} */ ($("canvas")) || /** @type {HTMLCanvasElement} */ (document.querySelector("#canvas"));
  keyboard = new Keyboard();
  // Erste World nur, um alles zu initialisieren; bleibt pausiert bis Start
  world = new World(canvas, keyboard);
  world.paused = true;
}

/**
 * Build a fresh world for level 1.
 * @param {{paused?:boolean}} [opts]
 * @returns {void}
 */
function buildWorld({ paused = false } = {}) {
  try {
    world?.freezeAll?.();
  } catch {}
  const lvl = typeof window.createLevel1 === "function" ? window.createLevel1() : window.level1;
  world = new World(canvas, keyboard, lvl);
  world.paused = !!paused;
}

/* -------------------- OVERLAYS / UI -------------------- */

const isStartVisible = () => !!(DOM.ovStart && !DOM.ovStart.classList.contains("hidden"));
const isSettingsVisible = () => !!(DOM.ovSettings && !DOM.ovSettings.classList.contains("hidden"));

const isTouch = () => matchMedia("(pointer: coarse)").matches;
const isLandscape = () => matchMedia("(orientation: landscape)").matches;

/**
 * Show/hide on-screen controls based on env & overlays.
 * @returns {void}
 */
function updateTouchButtonsVisibility() {
  const el = DOM.overlayButtons;
  if (!el) return;
  const show = isTouch() && isLandscape() && !isStartVisible() && !isSettingsVisible();
  el.classList.toggle("hidden", !show);
}

/**
 * Start the game: hide start overlay, fresh world, play music.
 * @returns {void}
 */
function startGame() {
  DOM.ovStart?.classList.add("hidden");
  DOM.backRow?.classList.add("hidden");
  buildWorld({ paused: false });
  startBGM();
  updateTouchButtonsVisibility();
}

/**
 * Open settings; pause if not on start.
 * @returns {void}
 */
function openSettings() {
  const onStart = isStartVisible();
  DOM.backRow?.classList.toggle("hidden", onStart);
  DOM.ovSettings?.classList.remove("hidden");
  if (world && !onStart) world.paused = true;
  updateTouchButtonsVisibility();
}

/**
 * Close settings; resume if not on start.
 * @returns {void}
 */
function closeSettings() {
  DOM.ovSettings?.classList.add("hidden");
  if (world && !isStartVisible()) world.paused = false;
  updateTouchButtonsVisibility();
}

/**
 * Go back to start overlay (pause world, kein Reload).
 * @returns {void}
 */
function backToStart() {
  DOM.ovSettings?.classList.add("hidden");
  DOM.ovStart?.classList.remove("hidden");
  DOM.backRow?.classList.add("hidden");
  if (world) world.paused = true;
  updateTouchButtonsVisibility();
}

/**
 * Show result overlay (win/lose), freeze world, bind actions.
 * @param {"win"|"lose"} kind
 * @returns {void}
 */
function showResult(kind) {
  const ov = DOM.ovResult,
    img = /** @type {HTMLImageElement|null} */ (DOM.resultImg);
  if (!ov || !img) return;
  img.src = kind === "win" ? "assets/imgs/You_won_you_lost/won.png" : "assets/imgs/You_won_you_lost/lost.png";
  img.alt = kind === "win" ? "Gewonnen" : "Verloren";
  try {
    world?.freezeAll?.();
  } catch {}
  ov.classList.remove("hidden");
  void ov.offsetWidth;
  ov.classList.add("show");
  ov.style.pointerEvents = "auto";
  bindResultActions();
}

/**
 * Bind result overlay buttons once (falls vorhanden).
 * @returns {void}
 */
function bindResultActions() {
  const ov = DOM.ovResult;
  if (!ov || ov.dataset.bound === "1") return;

  const btnRestart = /** @type {HTMLButtonElement|null} */ (DOM.btnResRestart);
  const btnStart = /** @type {HTMLButtonElement|null} */ (DOM.btnResStart);

  if (btnRestart) btnRestart.onclick = () => restartLevel();

  if (btnStart)
    btnStart.onclick = () => {
      ov.classList.add("hidden");
      ov.classList.remove("show");
      DOM.ovStart?.classList.remove("hidden");
      try {
        world?.freezeAll?.();
      } catch {}
      world = null;
      updateTouchButtonsVisibility();
    };

  ov.dataset.bound = "1";
}

/**
 * Restart level immediately (fresh world, skip start overlay).
 * @returns {void}
 */
function restartLevel() {
  DOM.ovResult?.classList.add("hidden");
  DOM.ovResult?.classList.remove("show");
  DOM.ovStart?.classList.add("hidden");
  buildWorld({ paused: false });
  startBGM();
  updateTouchButtonsVisibility();
}

/* -------------------- INPUT -------------------- */

/**
 * Toggle a Keyboard flag while a button is held (pointer events).
 * @param {HTMLElement|null} el
 * @param {"LEFT"|"RIGHT"|"UP"|"SPACE"} flag
 * @returns {void}
 */
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
  ["pointerup", "pointercancel", "pointerout", "mouseleave"].forEach((t) => el.addEventListener(t, up, { passive: false }));
}

/**
 * Pause world when touch device is in portrait orientation.
 * @returns {void}
 */
function syncPauseToOrientation() {
  if (!world) return;
  if (isTouch() && !isLandscape()) world.paused = true;
}

/* -------------------- DOM & EVENTS -------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Cache elements once
  DOM = {
    ovStart: $("overlay-1"),
    ovSettings: $("overlay-settings"),
    ovResult: $("overlay-result"),
    overlayButtons: $("overlay-buttons"),
    resultImg: $("result-img"),
    // start/settings
    btnStart: $("btn-start"),
    btnFab: $("btn-settings-fab"),
    btnClose: $("btn-close-settings"),
    btnBackStart: $("btn-back-start"),
    backRow: $("back-row"),
    // volume
    slider: $("volume-slider"),
    volumeLbl: $("volume-value"),
    btnMute: $("btn-mute"),
    // result (optional)
    btnResRestart: $("btn-result-restart"),
    btnResStart: $("btn-result-start"),
    // touch controls
    btnLeft: $("button-left"),
    btnRight: $("button-right"),
    btnJump: $("button-jump"),
    btnThrow: $("button-throw"),
  };

  // Audio UI
  updateMuteUI();
  applyVolumeAll();
  DOM.btnMute?.addEventListener("click", () => {
    window.gameMuted = !window.gameMuted;
    localStorage.setItem("gameMuted", window.gameMuted ? "1" : "0");
    updateMuteUI();
    applyVolumeAll();
    try {
      world?.character?.pauseStep?.();
    } catch {}
  });

  if (DOM.slider && DOM.volumeLbl) {
    const startPct = Math.round((window.gameVolume ?? 1) * 100);
    /** @type {HTMLInputElement} */ (DOM.slider).value = String(startPct);
    DOM.volumeLbl.textContent = `${startPct}%`;
    setGameVolumeFromSlider(startPct);
    DOM.slider.addEventListener("input", (e) => {
      const input = /** @type {HTMLInputElement} */ (e.target);
      const pct = input.value;
      DOM.volumeLbl.textContent = `${pct}%`;
      setGameVolumeFromSlider(pct);
    });
  }

  // Start/Settings handlers
  DOM.btnStart?.addEventListener("click", startGame);
  DOM.btnFab?.addEventListener("click", openSettings);
  DOM.btnFab?.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      openSettings();
    },
    { passive: false }
  );
  DOM.btnClose?.addEventListener("click", closeSettings);
  DOM.btnBackStart?.addEventListener("click", backToStart);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && DOM.ovSettings && !DOM.ovSettings.classList.contains("hidden")) closeSettings();
  });

  // Touch control bindings
  bindHold(DOM.btnLeft, "LEFT");
  bindHold(DOM.btnRight, "RIGHT");
  bindHold(DOM.btnJump, "UP");
  bindHold(DOM.btnThrow, "SPACE");

  // Initial UI sync
  syncPauseToOrientation();
  updateTouchButtonsVisibility();
});

// Keyboard controls
const keyToFlag = {
  ArrowLeft: "LEFT",
  a: "LEFT",
  A: "LEFT",
  ArrowUp: "UP",
  w: "UP",
  W: "UP",
  ArrowRight: "RIGHT",
  d: "RIGHT",
  D: "RIGHT",
  ArrowDown: "DOWN",
  s: "DOWN",
  S: "DOWN",
};
window.addEventListener("keydown", (e) => {
  if (e.key in keyToFlag) keyboard[keyToFlag[e.key]] = true;
  if (e.key === " ") keyboard.SPACE = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key in keyToFlag) keyboard[keyToFlag[e.key]] = false;
  if (e.key === " ") keyboard.SPACE = false;
});

// Window/layout updates
["resize", "orientationchange"].forEach((evt) => {
  window.addEventListener(evt, () => {
    syncPauseToOrientation();
    updateTouchButtonsVisibility();
  });
});
