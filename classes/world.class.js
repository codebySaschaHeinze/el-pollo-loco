/**
 * Game world orchestrating rendering, updates, collisions, HUD, and end conditions.
 * Owns the main loop, entity groups, SFX hookups and end-of-level flow.
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
  endDelayWinMs = 1500;
  endDelayLosesMs = 0;
  endTimer = null;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Keyboard} keyboard
   * @param {any} [levelInstance]
   */
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
    this.setWorld();
    this.draw();
    this.run();
  }

  /** Main render/update loop. */
  draw() {
    this.beginFrame();
    this.drawBackLayers();
    this.drawActors();
    this.drawFrontLayers();
    this.endFrame();
    this.raf = requestAnimationFrame(() => this.draw());
  }

  /** Clears canvas and applies camera transform. */
  beginFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
  }

  /** Background, parallax & pickups. */
  drawBackLayers() {
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.saloon);
    if (!this.paused) this.updateGroup(this.level.clouds);
    this.addObjectsToMap(this.level.clouds);
    if (!this.paused) this.updateGroup(this.level.birds);
    this.addObjectsToMap(this.level.birds);
    this.addObjectsToMap(this.level.bottlePickups);
    this.addObjectsToMap(this.level.coinPickups);
  }

  /** Enemies, boss HUD, character and projectiles. */
  drawActors() {
    if (!this.paused) this.updateGroup(this.level.enemies);
    this.addObjectsToMap(this.level.enemies);
    const boss = this.getBoss();
    if (boss?.healthBar) this.addToMap(boss.healthBar);
    this.addToMap(this.character);
    if (!this.paused) this.character.updateStepSound();
    else this.character.pauseStep();
    this.addObjectsToMap(this.throwableObjects);
    this.pruneThrowables();
  }

  /** Foreground, collisions and reset camera transform. */
  drawFrontLayers() {
    this.addObjectsToMap(this.level.foregroundObjects);
    if (!this.paused && !this.ending) this.checkCollisions();
    this.ctx.translate(-this.camera_x, 0);
  }

  /** HUD & end conditions. */
  endFrame() {
    this.addToMap(this.statusBar);
    this.addToMap(this.coinHUD);
    this.addToMap(this.bottleBar);
    this.checkEndConditions();
  }

  /** Bind world refs, ensure birds/boss, sync HUD. */
  setWorld() {
    this.bindWorldRefs();
    this.ensureBirds();
    this.setupBoss();
    this.syncHUDs();
  }

  /** Binds world refs to entities. */
  bindWorldRefs() {
    this.character.world = this;
    this.level.backgroundObjects?.forEach((o) => (o.world = this));
    this.level.enemies.forEach((e) => (e.world = this));
    this.level.bottlePickups?.forEach((b) => (b.world = this));
    this.level.coinPickups?.forEach((c) => (c.world = this));
    this.level.foregroundObjects?.forEach((f) => (f.world = this));
  }

  /** Spawns/attaches bird flock if missing. */
  ensureBirds() {
    if (!this.level.birds?.length) {
      const W = this.level?.level_end_x || 8000;
      this.level.birds = Birds.spawnFlock(50, W);
    }
    this.level.birds.forEach((b) => (b.world = this));
  }

  /** Sets up boss references and spawns minions if applicable. */
  setupBoss() {
    const boss = this.getBoss();
    if (!boss) return;
    boss.world = this;
    if (boss.healthBar) boss.healthBar.world = this;
    boss.startSpawning();
    this.level.endboss = boss;
    if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
  }

  /** Sync HUDs. */
  syncHUDs() {
    this.updateCoinHUD();
    this.updateBottleBar();
  }

  /** Starts periodic throw checks. */
  run() {
    this.throwTimer = setInterval(() => this.checkThrowObjects(), 200);
  }

  /** Freeze world (loops, timers, entities). */
  freezeAll() {
    this.stopLoops();
    this.freezeGroups();
  }

  /** Stops RAF and throw timer; pauses world. */
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

  /** Calls freeze on entities/groups. */
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

  /**
   * Spawns a bottle far in facing direction; updates HUD.
   * Uses higher vx & speedY; lowers acceleration for longer airtime.
   */
  checkThrowObjects() {
    if (this.paused || this.ending) return;
    if (!this.keyboard.SPACE || !this.character.canThrowBottle?.()) return;
    const left = !!this.character.otherDirection,
      dir = left ? -1 : 1;
    const xOff = left ? -20 : 50,
      yOff = 50;
    const b = new ThrowableObjects(this.character.x + xOff, this.character.y + yOff);
    b.world = this;
    b.otherDirection = left;
    b.vx = 16 * dir;
    b.speedY = 10;
    b.acceleration = 0.85;
    if (typeof b.speedX === "number") b.speedX = b.vx; // falls Projectile das nutzt
    this.throwableObjects.push(b);
    if (this.character.useBottle?.()) this.updateBottleBar();
  }

  /** All collision orchestration. */
  checkCollisions() {
    this.collectCoins();
    this.collectBottles();
    if (this.character.isDead?.()) return;
    this.resolveCharVsEnemies();
    this.resolveBossCollisions();
    this.resolveBottlesVsEnemies();
  }

  /** Coins pickup + HUD/SFX. */
  collectCoins() {
    const list = this.level.coinPickups;
    if (!list?.length) return;
    list.forEach((c) => {
      if (!c.collected && this.boxesCollide(this.character, c)) {
        if (typeof this.character.addCoin === "function") this.character.addCoin(1);
        else this.character.coins = (this.character.coins || 0) + 1;
        this.updateCoinHUD();
        this.playSfx("coinPickup", { clone: true });
        c.collected = true;
      }
    });
    this.level.coinPickups = list.filter((c) => !c.collected);
  }

  /** Bottles pickup + HUD/SFX. */
  collectBottles() {
    const list = this.level.bottlePickups;
    if (!list?.length) return;
    list.forEach((p) => {
      if (!p.collected && this.boxesCollide(this.character, p) && this.character.bottles < this.character.maxBottles) {
        this.character.addBottle(1);
        this.updateBottleBar();
        this.playSfx("bottlePickup", { reset: true });
        p.collected = true;
      }
    });
    this.level.bottlePickups = list.filter((p) => !p.collected);
  }

  /** Character vs non-boss enemies. */
  resolveCharVsEnemies() {
    this.level.enemies.forEach((e) => this.handleEnemyCollision(e));
  }

  /** Handles one enemy collision (incl. chicken stomp). */
  handleEnemyCollision(enemy) {
    if (enemy.dead) return;
    if (typeof Endboss !== "undefined" && enemy instanceof Endboss) return;
    if (!this.boxesCollide(this.character, enemy)) return;
    if (this.isChicken(enemy) && this.tryStomp(enemy)) return;
    const grace = this.character.isInStompGrace && this.character.isInStompGrace();
    if (!grace && this.character.hit?.()) this.statusBar.setPercentage(this.character.energy);
  }

  /** True if enemy is a Chicken/Chick. */
  isChicken(e) {
    return (typeof Chicken !== "undefined" && e instanceof Chicken) || (typeof Chick !== "undefined" && e instanceof Chick);
  }

  /** Try stomp from above; returns true if handled. */
  tryStomp(enemy) {
    const A = this.getBox(this.character),
      B = this.getBox(enemy);
    const falling = typeof this.character.fallingDown === "function" ? this.character.fallingDown() : this.character.speedY < 0;
    const fromAbove = falling && A.y + A.h - B.y >= 0 && A.y + A.h - B.y <= 40;
    if (!fromAbove) return false;
    enemy.die?.();
    this.playSfx("chickenHit", { reset: true });
    if (this.character.bounceOn) this.character.bounceOn(enemy);
    else {
      this.character.y = enemy.y - this.character.height;
      this.character.speedY = 15;
    }
    this.character.registerStomp?.();
    return true;
  }

  /** Boss collisions (char & bottles). */
  resolveBossCollisions() {
    const boss = this.getBoss();
    if (!boss || boss.dead) return;
    this.collideBossWithChar(boss);
    this.hitBossWithBottles(boss);
  }

  /** Character vs boss resolution. */
  collideBossWithChar(boss) {
    if (!this.boxesCollide(this.character, boss)) return;
    const grace = this.character.isInStompGrace && this.character.isInStompGrace();
    if (!grace && this.character.hit?.(20)) this.statusBar.setPercentage(this.character.energy);
    const push = this.character.x < boss.x ? -40 : 40;
    this.character.x += push;
    this.character.speedY = 12;
  }

  /** Bottles vs boss. */
  hitBossWithBottles(boss) {
    this.throwableObjects.forEach((b) => {
      if (b.gone || b.didDamage) return;
      const { ox, oy } = this.overlapXY(b, boss);
      if (ox >= 26 && oy >= 8) {
        b.didDamage = true;
        boss.takeHit?.(10);
        b.break?.() ?? (b.gone = true);
      }
    });
  }

  /** Bottles vs regular enemies. */
  resolveBottlesVsEnemies() {
    this.throwableObjects.forEach((b) => {
      if (b.gone || b.breaking || b.didDamage) return;
      for (let i = 0; i < this.level.enemies.length; i++) {
        const e = this.level.enemies[i];
        if (e.dead) continue;
        if (typeof Endboss !== "undefined" && e instanceof Endboss) continue;
        const { ox, oy } = this.overlapXY(b, e);
        if (ox >= 18 && oy >= 8) {
          e.die?.();
          b.didDamage = true;
          b.break?.() ?? (b.gone = true);
          break;
        }
      }
    });
  }

  /** Win/lose checks with single trigger. */
  checkEndConditions() {
    if (this.ending) return;
    if (this.character?.isDead?.()) {
      this.ending = true;
      this.scheduleEnd("lose", this.endDelayLosesMs);
      return;
    }
    const boss = this.level?.endboss;
    if (boss?.dead) {
      this.ending = true;
      this.scheduleEnd("win", this.endDelayWinMs);
    }
  }

  /**
   * Schedules freeze + result overlay after a delay.
   * @param {"win"|"lose"} kind
   * @param {number} [delayMs=0]
   */
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

  /**
   * Draw a list of objects.
   * @param {Array<{draw:(ctx:CanvasRenderingContext2D)=>void}>|null|undefined} objects
   */
  addObjectsToMap(objects) {
    if (!objects?.length) return;
    objects.forEach((o) => this.addToMap(o));
  }

  /**
   * Draw one object, mirroring if otherDirection is set.
   * @param {{draw:(ctx:CanvasRenderingContext2D)=>void, otherDirection?:boolean, x?:number, width?:number}} mo
   */
  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);
    mo.draw(this.ctx);
    if (mo.otherDirection) this.flipImageBack(mo);
  }

  /** Updates all objects in a group if they expose update(). */
  updateGroup(group) {
    group?.forEach((o) => o.update && o.update());
  }

  /** Removes projectiles flagged as gone. */
  pruneThrowables() {
    this.throwableObjects = this.throwableObjects.filter((b) => !b.gone);
  }

  /** Retrieves the current boss entity, if any. */
  getBoss() {
    return this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss)) || null;
  }

  /** Mirrors the context and flips object X for left-facing draw. */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /** Restores context and reverts object X after flip. */
  flipImageBack(mo) {
    this.ctx.restore();
    mo.x = mo.x * -1;
  }

  /**
   * Computes an AABB with optional per-object offsets.
   * @param {{x:number,y:number,width:number,height:number,offset?:{top:number,right:number,bottom:number,left:number}}} o
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

  /** Axis-aligned box intersection test. */
  boxesCollide(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
  }

  /** Overlap distances along X and Y between two AABBs. */
  overlapXY(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    const ox = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x));
    const oy = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y));
    return { ox, oy };
  }

  /** Converts bottle count (capped at 10) into HUD percentage in 20% steps. */
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
   * @param {string} name
   * @param {{clone?:boolean, reset?:boolean}} [opts]
   */
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
