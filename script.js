/**
 * @file Orchestrates game bootstrapping, global audio state (volume/mute),
 * overlay visibility, touch controls, and basic orientation handling.
 * Exposes some helpers on `window` for reuse across classes (e.g., SFX/BGM).
 */

/** @type {HTMLCanvasElement} */
let canvas;
/** @type {World} */
let world;
/** @type {Keyboard} */
let keyboard = new Keyboard();

/**
 * Whether game audio is muted (persisted in localStorage).
 * @global
 * @type {boolean}
 */
window.gameMuted = localStorage.getItem("gameMuted") === "1";

/**
 * Master game volume in the range [0..1] (persisted in localStorage).
 * @global
 * @type {number}
 */
window.gameVolume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem("gameVolume") ?? "1")));

/**
 * Effective volume that respects the mute toggle.
 * @global
 * @returns {number} 0 when muted, otherwise the current master volume [0..1].
 */
window.getEffectiveVolume = () => (window.gameMuted ? 0 : window.gameVolume);

/**
 * Applies the current effective volume to all registered SFX and BGM.
 * @returns {void}
 */
function applyVolumeAll() {
  const vol = window.getEffectiveVolume();
  if (window.SFX) Object.values(window.SFX).forEach((a) => a && (a.volume = vol));
  if (window.BGM) window.BGM.volume = vol;
}

/**
 * Updates the mute button icon and alt text according to the mute state.
 * @returns {void}
 */
function updateMuteUI() {
  const icon = document.getElementById("icon-mute");
  if (!icon) return;
  icon.src = window.gameMuted ? "assets/buttons/mute-on.png" : "assets/buttons/mute-off.png";
  icon.alt = window.gameMuted ? "Unmute" : "Mute";
}

/**
 * Creates an HTMLAudioElement for sound effects (SFX).
 * @param {string} src - Path to the audio file.
 * @param {boolean} [loop=false] - Whether the sound should loop.
 * @returns {HTMLAudioElement}
 */
function makeSfx(src, loop = false) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = loop;
  a.volume = window.getEffectiveVolume();
  return a;
}

/**
 * Global SFX registry.
 * @global
 * @type {Record<string, HTMLAudioElement>}
 */
window.SFX = window.SFX || {};
window.SFX.step = makeSfx("audio/footstep.wav", true);
window.SFX.bottleBreak = makeSfx("audio/broken-bottle.wav");
window.SFX.chickenHit = makeSfx("audio/chicken-noise.wav");
window.SFX.bossHurt = makeSfx("audio/big-chicken-noise.wav");
window.SFX.hurt = makeSfx("audio/hurt.wav");
window.SFX.bottlePickup = makeSfx("audio/collect-bottle.wav");
window.SFX.coinPickup = makeSfx("audio/collect-coin.wav");
window.SFX.jump = makeSfx("audio/jump.wav");

/**
 * Plays an SFX by name from the global registry, respecting mute/volume.
 * @param {string} name - Key in the `window.SFX` map.
 * @returns {void}
 */
window.playSfx = function (name) {
  const a = window.SFX?.[name];
  if (!a) return;
  a.volume = window.getEffectiveVolume();
  try {
    a.currentTime = 0;
    a.play();
  } catch (_) {}
};

/**
 * Creates an HTMLAudioElement for background music (BGM).
 * @param {string} src - Path to the audio file.
 * @returns {HTMLAudioElement}
 */
function makeBgm(src) {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = true;
  a.volume = window.getEffectiveVolume();
  return a;
}

/**
 * Active background music audio element (created on start).
 * @global
 * @type {HTMLAudioElement|null}
 */
window.BGM = null;

/**
 * Sets the master volume from a 0–100 slider value and applies it globally.
 * @param {number|string} pct - Slider value (0..100).
 * @returns {void}
 */
function setGameVolumeFromSlider(pct) {
  const v = Math.min(1, Math.max(0, (Number(pct) || 0) / 100));
  window.gameVolume = v;
  localStorage.setItem("gameVolume", String(v));
  applyVolumeAll();
}

/**
 * Checks if the start overlay is currently visible.
 * @returns {boolean}
 */
function isStartVisible() {
  const ov = document.getElementById("overlay-1");
  return !!(ov && !ov.classList.contains("hidden"));
}

/**
 * Checks if the settings overlay is currently visible.
 * @returns {boolean}
 */
function isSettingsVisible() {
  const ov = document.getElementById("overlay-settings");
  return !!(ov && !ov.classList.contains("hidden"));
}

/**
 * Detects coarse pointer (touch) devices via media query.
 * @returns {boolean}
 */
function isTouch() {
  return matchMedia("(pointer: coarse)").matches;
}

/**
 * Detects landscape orientation via media query.
 * @returns {boolean}
 */
function isLandscape() {
  return matchMedia("(orientation: landscape)").matches;
}

/**
 * Shows/hides touch buttons based on environment:
 * - touch device
 * - landscape orientation
 * - not on start overlay
 * - not on settings overlay
 * @returns {void}
 */
function updateTouchButtonsVisibility() {
  const overlayButtons = document.getElementById("overlay-buttons");
  if (!overlayButtons) return;
  const show = isTouch() && isLandscape() && !isStartVisible() && !isSettingsVisible();
  overlayButtons.classList.toggle("hidden", !show);
}

/**
 * Initializes canvas, keyboard, and world. Starts paused by default.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  keyboard = new Keyboard();
  world = new World(canvas, keyboard);
  world.paused = true;
}

document.addEventListener("DOMContentLoaded", () => {
  /** @type {HTMLElement|null} */
  const ovStart = document.getElementById("overlay-1");
  /** @type {HTMLElement|null} */
  const ovSettings = document.getElementById("overlay-settings");
  /** @type {HTMLButtonElement|null} */
  const btnBack = document.getElementById("btn-back-start");
  /** @type {HTMLImageElement|null} */
  const btnStart = document.getElementById("btn-start");
  /** @type {HTMLButtonElement|null} */
  const btnFab = document.getElementById("btn-settings-fab");
  /** @type {HTMLButtonElement|null} */
  const btnClose = document.getElementById("btn-close-settings");
  /** @type {HTMLButtonElement|null} */
  const btnResume = document.getElementById("btn-resume");
  /** @type {HTMLElement|null} */
  const resumeRow = document.getElementById("resume-row");
  /** @type {HTMLButtonElement|null} */
  const btnBackStart = document.getElementById("btn-back-start");
  /** @type {HTMLElement|null} */
  const backRow = document.getElementById("back-row");
  /** @type {HTMLInputElement|null} */
  const slider = document.getElementById("volume-slider");
  /** @type {HTMLElement|null} */
  const lbl = document.getElementById("volume-value");
  /** @type {HTMLButtonElement|null} */
  const btnMute = document.getElementById("btn-mute");

  updateMuteUI();
  applyVolumeAll();

  /**
   * Toggles mute, updates UI, applies volume to all audio, and stops step loop if needed.
   * @returns {void}
   */
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

  /**
   * Hides start overlay, starts BGM, unpauses world, and updates touch buttons.
   * @returns {void}
   */
  function startGame() {
    ovStart.classList.add("hidden");

    if (!window.BGM) window.BGM = makeBgm("audio/bg-music.wav");
    window.BGM.volume = window.getEffectiveVolume();
    window.BGM.play().catch(() => {});

    if (world) world.paused = false;
    updateTouchButtonsVisibility();
  }

  /**
   * Opens settings overlay, optionally pauses world (when not on start),
   * and updates touch buttons.
   * @returns {void}
   */
  function openSettings() {
    const inStart = isStartVisible();
    if (resumeRow) resumeRow.classList.toggle("hidden", inStart);
    if (backRow) backRow.classList.toggle("hidden", inStart);
    ovSettings.classList.remove("hidden");
    if (world && !inStart) world.paused = true;
    updateTouchButtonsVisibility();
  }

  /**
   * Closes settings overlay, resumes world if not on start, and updates touch buttons.
   * @returns {void}
   */
  function closeSettings() {
    ovSettings.classList.add("hidden");
    if (world && !isStartVisible()) world.paused = false;
    updateTouchButtonsVisibility();
  }

  /**
   * Returns to the start overlay and pauses the world.
   * @returns {void}
   */
  function backToStart() {
    ovSettings.classList.add("hidden");
    ovStart.classList.remove("hidden");
    if (world) world.paused = true;
    updateTouchButtonsVisibility();
  }

  /**
   * Performs a hard reset by reloading the page.
   * @returns {void}
   */
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

  /** @type {HTMLButtonElement|null} */
  const btnLeft = document.getElementById("button-left");
  /** @type {HTMLButtonElement|null} */
  const btnRight = document.getElementById("button-right");
  /** @type {HTMLButtonElement|null} */
  const btnJump = document.getElementById("button-jump");
  /** @type {HTMLButtonElement|null} */
  const btnThrow = document.getElementById("button-throw");

  /**
   * Binds a "hold" behavior to a button to toggle a Keyboard flag while pressed.
   * Works across pointer, touch and mouse events.
   * @param {HTMLElement|null} el - The button element.
   * @param {"LEFT"|"RIGHT"|"UP"|"SPACE"} flag - Keyboard flag to toggle.
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

/**
 * Shows the result overlay (win/lose), pauses the world, offers actions.
 * @param {"win"|"lose"} kind
 */
function showResult(kind) {
  const ov = document.getElementById("overlay-result");
  const img = document.getElementById("result-img");
  if (!ov || !img) return;

  const WIN_IMG = "assets/imgs/You_won_you_lost/won.png";
  const LOSE_IMG = "assets/imgs/You_won_you_lost/lost.png";

  img.src = kind === "win" ? WIN_IMG : LOSE_IMG;
  img.alt = kind === "win" ? "Gewonnen" : "Verloren";
  try {
    window.world?.freezeAll?.();
  } catch (_) {}

  ov.classList.remove("hidden");
  void ov.offsetWidth;
  ov.classList.add("show");
  ov.style.pointerEvents = "auto";
  if (typeof bindResultActions === "function") bindResultActions();
}

/**
 * Wires up click handlers for result overlay actions once.
 * @returns {void}
 */
function bindResultActions() {
  const ov = document.getElementById("overlay-result");
  if (!ov || ov.dataset.bound === "1") return;
  const btnRestart = document.getElementById("btn-result-restart");
  const btnStart = document.getElementById("btn-result-start");
  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      try {
        if (window.world) window.world.paused = true;
      } catch (_) {}
      location.reload();
    });
  }
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      ov.classList.add("hidden");
      ov.classList.remove("show");
      const startOverlay = document.getElementById("overlay-1");
      if (startOverlay) startOverlay.classList.remove("hidden");
      try {
        if (window.world) window.world.paused = true;
      } catch (_) {}
    });
  }
  ov.dataset.bound = "1";
}

/**
 * Pauses the world when on touch devices in portrait orientation.
 * No-op otherwise or before world exists.
 * @returns {void}
 */
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

(function setupResultActions() {
  const res = document.getElementById("overlay-result");
  const btnRestart = document.getElementById("btn-result-restart");
  const btnStart = document.getElementById("btn-result-start");
  if (!res || !btnRestart || !btnStart) return;
  btnRestart.addEventListener("click", () => {
    try {
      if (window.world) window.world.paused = true;
    } catch (_) {}
    location.reload();
  });

  btnStart.addEventListener("click", () => {
    res.classList.add("hidden");
    res.classList.remove("show");
    const startOverlay = document.getElementById("overlay-1");
    if (startOverlay) startOverlay.classList.remove("hidden");
    try {
      if (window.world) window.world.paused = true;
    } catch (_) {}
  });
})();
