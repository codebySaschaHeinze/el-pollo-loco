/**
 * Game world: wiring, loop control, HUD sync, SFX helper, and scheduling.
 * Heavy lifting is delegated to RenderSystem, ThrowSystem, CollisionSystem.
 */
class World {
  character;
  level = null;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  bottleBar = new BottleBar();
  coinHUD = new CoinHUD();
  throwableObjects = [];
  paused = false;
  ending = false;
  raf = null;
  throwTimer = null;
  endTimer = null;
  endDelayWinMs = 1500;
  endDelayLosesMs = 0;

  /** Sets up world, level, character, systems and starts loops. */
  constructor(canvas, keyboard, levelInstance = null) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level =
      levelInstance || (typeof window.createLevel1 === "function" ? window.createLevel1() : typeof level1 !== "undefined" ? level1 : null);
    if (!this.level) {
      console.error("[World] No level instance.");
      return;
    }
    this.character = new Character(this.keyboard);
    this.character.x = 100;
    this.renderer = new RenderSystem(this);
    this.throwSys = new ThrowSystem(this);
    this.coll = new CollisionSystem(this);
    this.setWorld();
    this.draw();
    this.run();
  }

  /** Main loop: delegate to renderer and end-checker. */
  draw() {
    this.renderer.beginFrame();
    this.renderer.drawBack();
    this.renderer.drawActors();
    this.renderer.drawFront();
    this.renderer.drawHudAndEnd();
    this.raf = requestAnimationFrame(() => this.draw());
  }

  /** Links world to entities, birds, boss, then HUD sync. */
  setWorld() {
    this.character.world = this;
    this.level.backgroundObjects?.forEach((o) => (o.world = this));
    this.level.enemies.forEach((e) => (e.world = this));
    this.level.bottlePickups?.forEach((b) => (b.world = this));
    this.level.coinPickups?.forEach((c) => (c.world = this));
    this.level.foregroundObjects?.forEach((f) => (f.world = this));
    if (!this.level.birds?.length) {
      const W = this.level?.level_end_x || 8000;
      this.level.birds = Birds.spawnFlock(50, W);
    }
    this.level.birds.forEach((b) => (b.world = this));
    const boss = this.getBoss();
    if (boss) {
      boss.world = this;
      boss.healthBar && (boss.healthBar.world = this);
      boss.startSpawning();
      this.level.endboss = boss;
      if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
    }
    this.updateCoinHUD();
    this.updateBottleBar();
  }

  /** Starts periodic throw checks. */
  run() {
    this.throwTimer = setInterval(() => this.throwSys.tick(), 200);
  }

  /** Delegates collision step to CollisionSystem. */
  checkCollisions() {
    this.coll.step();
  }

  /** Delegates end checking to CollisionSystem. */
  checkEndConditions() {
    this.coll.checkEnd();
  }

  /** Stops RAF, timers and freezes entities. */
  freezeAll() {
    this.stopLoops();
    this.freezeGroups();
  }

  /** Cancels RAF and throw timer; pauses world. */
  stopLoops() {
    this.paused = true;
    if (this.raf != null) {
      try {
        cancelAnimationFrame(this.raf);
      } catch {}
      this.raf = null;
    }
    if (this.throwTimer != null) {
      try {
        clearInterval(this.throwTimer);
      } catch {}
      this.throwTimer = null;
    }
  }

  /** Calls freeze() across groups. */
  freezeGroups() {
    this.character?.freeze?.();
    this.getBoss()?.freeze?.();
    this.level?.enemies?.forEach((e) => e?.freeze?.());
    this.level?.birds?.forEach((b) => b?.freeze?.());
    this.level?.clouds?.forEach((c) => c?.freeze?.());
    this.level?.foregroundObjects?.forEach((f) => f?.freeze?.());
    this.level?.backgroundObjects?.forEach((o) => o?.freeze?.());
    this.throwableObjects?.forEach((t) => t?.freeze?.());
  }

  /** Removes projectiles flagged gone. */
  pruneThrowables() {
    this.throwableObjects = this.throwableObjects.filter((b) => !b.gone);
  }

  /** Finds current boss. */
  getBoss() {
    return this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss)) || null;
  }

  /** Schedules freeze + result overlay after delay. */
  scheduleEnd(kind, delayMs = 0) {
    if (this.endTimer != null) {
      try {
        clearTimeout(this.endTimer);
      } catch {}
      this.endTimer = null;
    }
    try {
      this.character?.pauseStep?.();
    } catch {}
    this.endTimer = setTimeout(() => {
      this.freezeAll();
      showResult(kind);
      this.endTimer = null;
    }, Math.max(0, delayMs | 0));
  }

  /** Bottle HUD sync. */
  updateBottleBar() {
    const b = Math.min(this.character?.bottles || 0, 10);
    this.bottleBar.setPercentage(Math.floor(b / 2) * 20);
  }

  /** Coin HUD sync. */
  updateCoinHUD() {
    this.coinHUD.setCount(this.character?.coins || 0);
  }

  /** Plays SFX via window.SFX respecting global volume. */
  playSfx(name, opts = {}) {
    const s = window.SFX?.[name];
    if (!s) return;
    try {
      const a = opts.clone ? s.cloneNode() : s;
      if (opts.reset) a.currentTime = 0;
      a.volume = window.getEffectiveVolume ? window.getEffectiveVolume() : a.volume;
      a.play();
    } catch {}
  }
}
