/**
 * @file Bootstraps the game, handles audio (mute/volume), overlays,
 * touch controls and orientation. Exposes helpers on window.
 */

canvas = null;
let world = null;
let keyboard = new GameKeyboard();

/**
 * Shorthand to get an element by id.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
const $ = (id) => /** @type {HTMLElement|null} */ (document.getElementById(id));

/** Frequently used nodes (filled on DOMContentLoaded). */
let DOM = /** @type {Record<string, HTMLElement|null>} */ ({});
window.gameMuted = localStorage.getItem("gameMuted") === "1";
window.gameVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("gameVolume") ?? "1")));
window.getEffectiveVolume = () => (window.gameMuted ? 0 : window.gameVolume);

/**
 * Apply the effective volume to all registered SFX and BGM.
 * @returns {void}
 */
function applyVolumeAll() {
  const v = window.getEffectiveVolume();
  if (window.SFX) Object.values(window.SFX).forEach((a) => a && (a.volume = v));
  if (window.BGM) window.BGM.volume = v;
}

/**
 * Update mute icon according to the current state.
 * @returns {void}
 */
function updateMuteUI() {
  const icon = /** @type {HTMLImageElement|null} */ ($("icon-mute"));
  if (!icon) return;
  icon.src = window.gameMuted ? "assets/buttons/mute-on.png" : "assets/buttons/mute-off.png";
  icon.alt = window.gameMuted ? "Unmute" : "Mute";
}

/**
 * Create an HTMLAudioElement for SFX.
 * @param {string} src - File path.
 * @param {boolean} [loop=false] - Whether to loop.
 * @returns {HTMLAudioElement}
 */
function makeSfx(src, loop = false) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = loop;
  a.volume = window.getEffectiveVolume();
  return a;
}

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

window.playSfx = function (name) {
  const a = window.SFX?.[name];
  if (!a) return;
  a.volume = window.getEffectiveVolume();
  try {
    a.currentTime = 0;
    a.play();
  } catch {}
};

window.BGM = null;

/**
 * Set master volume from a 0..100 slider value and apply globally.
 * @param {number|string} pct
 * @returns {void}
 */
function setGameVolumeFromSlider(pct) {
  const v = Math.min(1, Math.max(0, (Number(pct) || 0) / 100));
  window.gameVolume = v;
  localStorage.setItem("gameVolume", String(v));
  applyVolumeAll();
}

/**
 * Ensure BGM exists and is playing.
 * @returns {void}
 */
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

/**
 * Initialize canvas, keyboard, and a paused world.
 * (Called via body onload="init()")
 * @returns {void}
 */
function init() {
  canvas = /** @type {HTMLCanvasElement} / ($("canvas")) || /* @type {HTMLCanvasElement} */ (document.querySelector("#canvas"));
  keyboard = new GameKeyboard();
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

const isStartVisible = () => !!(DOM.ovStart && !DOM.ovStart.classList.contains("hidden"));
const isSettingsVisible = () => !!(DOM.ovSettings && !DOM.ovSettings.classList.contains("hidden"));
const isTouch = () => matchMedia("(pointer: coarse)").matches;
const isLandscape = () => matchMedia("(orientation: landscape)").matches;

/**
 * Open legal overlay and load the requested document into it.
 * Pauses the world if not on the start screen.
 * @param {"impressum"|"datenschutz"} kind
 * @returns {void}
 */
function openLegal(kind) {
  const ov = document.getElementById("overlay-legal");
  const title = document.getElementById("legal-title");
  const body = document.getElementById("legal-body");
  if (!ov || !title || !body) return;

  title.textContent = kind === "impressum" ? "Impressum" : "Datenschutz";
  body.innerHTML = "Lädt …";
  if (window.world && !isStartVisible()) window.world.paused = true;
  ov.classList.remove("hidden");

  fetch(`${kind}.html`)
    .then((r) => r.text())
    .then((html) => {
      // Try <main> first, fallback to <body>; capture full content.
      const m = html.match(/<main[^>]>([\s\S]?)<\/main>/i) || html.match(/<body[^>]>([\s\S]?)<\/body>/i);
      body.innerHTML = m ? m[1] : html;
    })
    .catch(() => (body.textContent = "Inhalt konnte nicht geladen werden."));
}

/**
 * Close the legal overlay and resume (if not on start).
 * @returns {void}
 */
function closeLegal() {
  const ov = document.getElementById("overlay-legal");
  ov?.classList.add("hidden");
  if (window.world && !isStartVisible()) window.world.paused = false;
}

/**
 * Show/hide on-screen touch controls based on device/orientation/overlays.
 * @returns {void}
 */
function updateTouchButtonsVisibility() {
  const el = DOM.overlayButtons;
  if (!el) return;
  const show = isTouch() && isLandscape() && !isStartVisible() && !isSettingsVisible();
  el.classList.toggle("hidden", !show);
}

/**
 * Start the game: hide start overlay, create fresh world, play music.
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
 * Open settings; pause world if not on start.
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
 * Close settings; resume world if not on start.
 * @returns {void}
 */
function closeSettings() {
  DOM.ovSettings?.classList.add("hidden");
  if (world && !isStartVisible()) world.paused = false;
  updateTouchButtonsVisibility();
}

/**
 * Return to start overlay and pause the world (no reload).
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
  const ov = DOM.ovResult;
  const img = /** @type {HTMLImageElement|null} */ (DOM.resultImg);
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
 * Bind result overlay buttons exactly once.
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
 * Restart the level immediately (fresh world, skip start overlay).
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

/**
 * Toggle a keyboard flag while the given button is held (pointer events).
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
 * Pause world when on a touch device in portrait orientation.
 * @returns {void}
 */
function syncPauseToOrientation() {
  if (!world) return;
  if (isTouch() && !isLandscape()) world.paused = true;
}

document.addEventListener("DOMContentLoaded", () => {
  DOM = {
    ovStart: $("overlay-1"),
    ovSettings: $("overlay-settings"),
    ovResult: $("overlay-result"),
    overlayButtons: $("overlay-buttons"),
    resultImg: $("result-img"),
    btnStart: $("btn-start"),
    btnFab: $("btn-settings-fab"),
    btnClose: $("btn-close-settings"),
    btnBackStart: $("btn-back-start"),
    backRow: $("back-row"),
    slider: $("volume-slider"),
    volumeLbl: $("volume-value"),
    btnMute: $("btn-mute"),
    btnResRestart: $("btn-result-restart"),
    btnResStart: $("btn-result-start"),
    btnLeft: $("button-left"),
    btnRight: $("button-right"),
    btnJump: $("button-jump"),
    btnThrow: $("button-throw"),
  };

  document.querySelector('.legal-links a[href="./impressum.html"]')?.addEventListener("click", (e) => {
    e.preventDefault();
    openLegal("impressum");
  });
  document.querySelector('.legal-links a[href="./datenschutz.html"]')?.addEventListener("click", (e) => {
    e.preventDefault();
    openLegal("datenschutz");
  });
  document.getElementById("btn-legal-close")?.addEventListener("click", closeLegal);

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
    DOM.volumeLbl.textContent = `${startPct}%`;
    setGameVolumeFromSlider(startPct);
    DOM.slider.addEventListener("input", (e) => {
      const input = /** @type {HTMLInputElement} */ (e.target);
      const pct = input.value;
      DOM.volumeLbl.textContent = `${pct}%`;
      setGameVolumeFromSlider(pct);
    });
  }

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

  bindHold(DOM.btnLeft, "LEFT");
  bindHold(DOM.btnRight, "RIGHT");
  bindHold(DOM.btnJump, "UP");
  bindHold(DOM.btnThrow, "SPACE");
  syncPauseToOrientation();
  updateTouchButtonsVisibility();
});

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

["resize", "orientationchange"].forEach((evt) => {
  window.addEventListener(evt, () => {
    syncPauseToOrientation();
    updateTouchButtonsVisibility();
  });
});
