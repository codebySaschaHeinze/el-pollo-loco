/**
 * Options for playing sound effects from the global SFX registry.
 * @typedef {Object} PlaySfxOptions
 * @property {boolean} [clone] - Clone the audio node before playing.
 * @property {boolean} [reset] - Reset currentTime before playing.
 */

/**
 * Game world orchestrating rendering, updates, collisions, HUD, and end conditions.
 * @class
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
  _ending = false;
  _raf = null;
  _throwTimer = null;
  _endDelayWinMs = 1500;
  _endDelayLosesMs = 0;

  /**
   * @param {HTMLCanvasElement} canvas - Render target.
   * @param {Keyboard} keyboard - Input source.
   */

  constructor(canvas, keyboard, levelInstance = null) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level =
      levelInstance || (typeof window.createLevel1 === "function" ? window.createLevel1() : typeof level1 !== "undefined" ? level1 : null);
    if (!this.level) {
      console.error("[World] No level instance available. Did you define createLevel1()?");
      return;
    }
    this.character = new Character(this.keyboard);
    this.character.x = 100;
    this.setWorld();
    this.draw();
    this.run();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.saloon);
    if (!this.paused) this.updateGroup(this.level.clouds);
    this.addObjectsToMap(this.level.clouds);
    if (!this.paused) this.updateGroup(this.level.birds);
    this.addObjectsToMap(this.level.birds);
    this.addObjectsToMap(this.level.bottlePickups);
    this.addObjectsToMap(this.level.coinPickups);
    if (!this.paused) this.updateGroup(this.level.enemies);
    this.addObjectsToMap(this.level.enemies);
    const boss = this.getBoss();
    if (boss?.healthBar) this.addToMap(boss.healthBar);
    this.addToMap(this.character);
    if (!this.paused) this.character.updateStepSound();
    else this.character.pauseStep();
    this.addObjectsToMap(this.throwableObjects);
    this.pruneThrowables();
    this.addObjectsToMap(this.level.foregroundObjects);
    if (!this.paused && !this._ending) this.checkCollisions();
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.coinHUD);
    this.addToMap(this.bottleBar);
    this.checkEndConditions();
    this._raf = requestAnimationFrame(() => this.draw());
  }

  /**
   * Freezes the entire world:
   * - sets paused=true
   * - cancels rAF loop
   * - clears throw interval
   * - calls .freeze() on entities that support it
   * @returns {void}
   */
  freezeAll() {
    this.paused = true;
    if (this._raf != null) {
      try {
        cancelAnimationFrame(this._raf);
      } catch (_) {}
      this._raf = null;
    }
    if (this._throwTimer != null) {
      try {
        clearInterval(this._throwTimer);
      } catch (_) {}
      this._throwTimer = null;
    }
    this.character?.freeze?.();
    const boss = this.getBoss();
    boss?.freeze?.();
    this.level?.enemies?.forEach((e) => e?.freeze?.());
    this.level?.birds?.forEach((b) => b?.freeze?.());
    this.level?.clouds?.forEach((c) => c?.freeze?.());
    this.level?.foregroundObjects?.forEach((f) => f?.freeze?.());
    this.level?.backgroundObjects?.forEach((o) => o?.freeze?.());
    this.throwableObjects?.forEach((t) => t?.freeze?.());
  }

  /**
   * Binds world refs, spawns flock/boss if needed, and syncs HUDs.
   * @returns {void}
   */
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
      if (boss.healthBar) boss.healthBar.world = this;
      boss.startSpawning();
      this.level.endboss = boss;
      if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
    }
    this.updateCoinHUD();
    this.updateBottleBar();
  }
  run() {
    this._throwTimer = setInterval(() => this.checkThrowObjects(), 200);
  }
  checkThrowObjects() {
    if (this.paused || this._ending) return;
    if (this.keyboard.SPACE && this.character.canThrowBottle?.()) {
      const bottle = new ThrowableObjects(this.character.x + 50, this.character.y + 50);
      bottle.world = this;
      this.throwableObjects.push(bottle);
      if (this.character.useBottle?.()) this.updateBottleBar();
    }
  }
  checkCollisions() {
    this.collectCoins();
    this.collectBottles();
    if (this.character.isDead?.()) return;
    this.resolveCharVsEnemies();
    this.resolveBossCollisions();
    this.resolveBottlesVsEnemies();
  }
  collectCoins() {
    const list = this.level.coinPickups;
    if (!list?.length) return;
    list.forEach((c) => {
      if (c.collected) return;
      if (this.boxesCollide(this.character, c)) {
        if (typeof this.character.addCoin === "function") this.character.addCoin(1);
        else this.character.coins = (this.character.coins || 0) + 1;
        this.updateCoinHUD();
        this.playSfx("coinPickup", { clone: true });
        c.collected = true;
      }
    });
    this.level.coinPickups = list.filter((c) => !c.collected);
  }
  collectBottles() {
    const list = this.level.bottlePickups;
    if (!list?.length) return;
    list.forEach((p) => {
      if (p.collected) return;
      if (this.boxesCollide(this.character, p)) {
        if (this.character.bottles < this.character.maxBottles) {
          this.character.addBottle(1);
          this.updateBottleBar();
          this.playSfx("bottlePickup", { reset: true });
          p.collected = true;
        }
      }
    });
    this.level.bottlePickups = list.filter((p) => !p.collected);
  }
  resolveCharVsEnemies() {
    this.level.enemies.forEach((enemy) => {
      if (enemy.dead) return;
      if (typeof Endboss !== "undefined" && enemy instanceof Endboss) return;
      if (!this.boxesCollide(this.character, enemy)) return;
      const isChicken =
        (typeof Chicken !== "undefined" && enemy instanceof Chicken) || (typeof Chick !== "undefined" && enemy instanceof Chick);
      if (isChicken) {
        const charBox = this.getBox(this.character);
        const enemyBox = this.getBox(enemy);
        const isFalling = typeof this.character.fallingDown === "function" ? this.character.fallingDown() : this.character.speedY < 0;
        const charBottom = charBox.y + charBox.h;
        const overlapY = charBottom - enemyBox.y;
        const fromAbove = isFalling && overlapY >= 0 && overlapY <= 40;
        if (fromAbove) {
          enemy.die?.();
          this.playSfx("chickenHit", { reset: true });
          if (typeof this.character.bounceOn === "function") this.character.bounceOn(enemy);
          else {
            this.character.y = enemy.y - this.character.height;
            this.character.speedY = 15;
          }
          if (typeof this.character.registerStomp === "function") this.character.registerStomp();
          return;
        }
      }
      const inStompGrace = this.character.isInStompGrace && this.character.isInStompGrace();
      if (!inStompGrace && typeof this.character.hit === "function") {
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
      }
    });
  }

  resolveBossCollisions() {
    const boss = this.getBoss();
    if (!boss || boss.dead) return;

    if (this.boxesCollide(this.character, boss)) {
      const inStompGrace = this.character.isInStompGrace && this.character.isInStompGrace();
      if (!inStompGrace && this.character.hit?.(20)) {
        this.statusBar.setPercentage(this.character.energy);
      }
      const push = this.character.x < boss.x ? -40 : 40;
      this.character.x += push;
      this.character.speedY = 12;
    }
    this.throwableObjects.forEach((bottle) => {
      if (bottle.gone || bottle.didDamage) return;
      const { ox, oy } = this.overlapXY(bottle, boss);
      if (ox >= 26 && oy >= 8) {
        bottle.didDamage = true;
        boss.takeHit?.(10);
        if (typeof bottle.break === "function") bottle.break();
        else bottle.gone = true;
      }
    });
  }

  /** Bottles vs regular enemies. */
  resolveBottlesVsEnemies() {
    this.throwableObjects.forEach((bottle) => {
      if (bottle.gone || bottle.breaking || bottle.didDamage) return;
      for (let i = 0; i < this.level.enemies.length; i++) {
        const e = this.level.enemies[i];
        if (e.dead) continue;
        if (typeof Endboss !== "undefined" && e instanceof Endboss) continue;
        const { ox, oy } = this.overlapXY(bottle, e);
        if (ox >= 18 && oy >= 8) {
          e.die?.();
          bottle.didDamage = true;
          if (typeof bottle.break === "function") bottle.break();
          else bottle.gone = true;
          break;
        }
      }
    });
  }

  /** Win/lose checks with single trigger (win waits a bit for boss death anim). */
  checkEndConditions() {
    if (this._ending) return;
    if (this.character?.isDead?.()) {
      this._ending = true;
      this.scheduleEnd("lose", this._endDelayLosesMs);
      return;
    }
    const boss = this.level?.endboss;
    if (boss?.dead) {
      this._ending = true;
      this.scheduleEnd("win", this._endDelayWinMs);
    }
  }

  /**
   * Draws a list of objects.
   * @param {Array<Object>|null|undefined} objects - Items implementing draw(ctx).
   */
  addObjectsToMap(objects) {
    if (!objects?.length) return;
    objects.forEach((o) => this.addToMap(o));
  }

  /**
   * Draws one object, mirroring if otherDirection is set.
   * @param {Object} mo - Drawable with draw(ctx) and optional otherDirection.
   */
  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);
    mo.draw(this.ctx);
    if (mo.otherDirection) this.flipImageBack(mo);
  }

  /**
   * Updates all objects in a group if they expose update().
   * @param {Array<Object>|null|undefined} group - Objects with optional update().
   */
  updateGroup(group) {
    group?.forEach((o) => o.update && o.update());
  }

  /** Removes projectiles flagged as gone. */
  pruneThrowables() {
    this.throwableObjects = this.throwableObjects.filter((b) => !b.gone);
  }

  /**
   * Retrieves the current boss entity if available.
   * @returns {any|null}
   */
  getBoss() {
    return this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss)) || null;
  }

  /**
   * Mirrors the context and flips object X for left-facing draw.
   * @param {Object} mo - Movable/drawable with x and width.
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores context and reverts object X after flip.
   * @param {Object} mo - Movable/drawable with x.
   */
  flipImageBack(mo) {
    this.ctx.restore();
    mo.x = mo.x * -1;
  }

  /**
   * Computes an AABB with optional per-object offsets.
   * @param {Object} o - {x,y,width,height,offset?}
   * @returns {{x:number,y:number,w:number,h:number}}
   */
  getBox(o) {
    const off = o?.offset || { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      x: o.x + off.left,
      y: o.y + off.top,
      w: Math.max(0, o.width - off.left - off.right),
      h: Math.max(0, o.height - off.top - off.bottom),
    };
  }

  /**
   * Axis-aligned box intersection test.
   * @param {Object} a
   * @param {Object} b
   * @returns {boolean}
   */
  boxesCollide(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
  }

  /**
   * Overlap distances along X and Y between two AABBs.
   * @param {Object} a
   * @param {Object} b
   * @returns {{ox:number, oy:number}}
   */
  overlapXY(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    const ox = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x));
    const oy = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y));
    return { ox, oy };
  }

  /**
   * Converts bottle count (capped at 10) into HUD percentage in 20% steps.
   * @returns {number}
   */
  toBottlePercent() {
    const b = Math.min(this.character?.bottles || 0, 10);
    return Math.floor(b / 2) * 20;
  }

  /** Syncs bottle HUD. */
  updateBottleBar() {
    this.bottleBar.setPercentage(this.toBottlePercent());
  }

  /** Syncs coin HUD. */
  updateCoinHUD() {
    this.coinHUD.setCount(this.character?.coins || 0);
  }

  /**
   * Plays a named SFX from window.SFX with volume management.
   * @param {string} name - Key in window.SFX.
   * @param {PlaySfxOptions} [opts] - Playback options.
   * @returns {void}
   */
  playSfx(name, opts = {}) {
    const s = window.SFX?.[name];
    if (!s) return;
    try {
      const audio = opts.clone ? s.cloneNode() : s;
      if (opts.reset) audio.currentTime = 0;
      audio.volume = window.getEffectiveVolume ? window.getEffectiveVolume() : audio.volume;
      audio.play();
    } catch (_) {}
  }

  /**
   * Schedules freeze + result overlay after a delay.
   * During delay, collisions are already halted via _ending.
   * @param {"win"|"lose"} kind
   * @param {number} delayMs
   * @returns {void}
   */
  scheduleEnd(kind, delayMs = 0) {
    if (this._endTimer != null) {
      try {
        clearTimeout(this._endTimer);
      } catch (_) {}
      this._endTimer = null;
    }
    try {
      this.character?.pauseStep?.();
    } catch (_) {}
    this._endTimer = setTimeout(() => {
      this.freezeAll();
      showResult(kind);
      this._endTimer = null;
    }, Math.max(0, delayMs | 0));
  }
}
