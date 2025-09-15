/**
 * Endboss with patrol/attack AI, hurt/death states, fade-out, healthbar
 * and periodic chick spawning. Uses sprite strips for each state.
 * @extends MovableObjects
 */
class Endboss extends MovableObjects {
  width = 250;
  height = 400;
  x = 700;
  y = 50;
  energy = 100;
  maxEnergy = 100;
  dead = false;
  spawnInterval = null;
  animInterval = null;
  currentImage = 0;
  state = "walk";
  patrolMinX = 8000;
  patrolMaxX = 8700;
  speed = 1.5;
  attackEveryMs = 2500;
  attackSpeed = 3.2;
  attackDuration = 1000;
  attackCooldown = 1000;
  lastAttackAt = 0;
  attacking = false;
  attackUntil = 0;
  hurtMs = 250;
  hurtUntil = 0;
  dying = false;
  deathIndex = 0;
  deathDone = false;
  deathFrameMs = 120;
  fadeOutMs = 1000;
  fadeStartAt = 0;
  vanished = false;
  otherDirection = true;

  IMAGES_WALKING = [
    "assets/imgs/4_enemie_boss_chicken/1_walk/g1.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g2.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g3.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g4.png",
  ];

  IMAGES_ATTACK = [
    "assets/imgs/4_enemie_boss_chicken/3_attack/g13.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g13.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g15.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g16.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g17.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g18.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g19.png",
  ];

  IMAGES_HURT = [
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g21.png",
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g22.png",
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g23.png",
  ];

  IMAGES_DEAD = [
    "assets/imgs/4_enemie_boss_chicken/5_dead/g24.png",
    "assets/imgs/4_enemie_boss_chicken/5_dead/g25.png",
    "assets/imgs/4_enemie_boss_chicken/5_dead/g26.png",
  ];

  /**
   * Sets up sprites, healthbar and animation loop.
   */
  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.offset = { top: 20, right: 40, bottom: 20, left: 40 };
    this.maxEnergy = this.energy;
    if (typeof BossHealthBar !== "undefined") this.healthBar = new BossHealthBar(this);
    this.lastAttackAt = Date.now();
    this.animate();
  }

  /**
   * Draws, and if dying+finished, performs fade-up fade-out then vanish.
   */
  draw(ctx) {
    if (this.vanished) return;
    if (this.dying && this.deathDone) {
      const start = this.fadeStartAt || Date.now();
      const t = Math.min((Date.now() - start) / this.fadeOutMs, 1);
      const oldY = this.y;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      this.y = oldY - Math.floor(this.height * 0.4 * t);
      super.draw(ctx);
      this.y = oldY;
      ctx.restore();
      if (t >= 1) this.vanished = true;
      return;
    }
    super.draw(ctx);
  }

  /**
   * Sprite animator for walk/attack/hurt/death sequences.
   */
  animate() {
    if (this.world?.paused) return;
    this.animInterval = setInterval(() => {
      if (this.dying) {
        const last = this.IMAGES_DEAD.length - 1;
        const idx = Math.min(this.deathIndex, last);
        const f = this.IMAGES_DEAD[idx];
        if (f) this.loadImage(f);
        if (this.deathIndex < last) this.deathIndex++;
        else {
          this.deathDone = true;
          if (!this.fadeStartAt) this.fadeStartAt = Date.now();
        }
        return;
      }
      if (this.dead) return;
      const frames = Date.now() < this.hurtUntil ? this.IMAGES_HURT : this.state === "attack" ? this.IMAGES_ATTACK : this.IMAGES_WALKING;
      this.playAnimation(frames);
    }, this.deathFrameMs);
  }

  /**
   * Called each frame from World; handles init, attack, patrol.
   */
  update() {
    if (this.vanished || this.dying || this.dead) return;
    this.ensureInit();
    const now = Date.now();
    if (this.attackMove(now)) return;
    if (this._maybeStartAttack(now)) return;
    this.patrolStep();
  }

  /**
   * One-time patrol bounds init and default direction.
   */
  ensureInit() {
    if (this._initd) return;
    this._initd = true;
    if (this.x < this.patrolMinX) this.x = this.patrolMinX;
    if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
    this._dir = -1;
    this.otherDirection = false;
  }

  /**
   * Advances attack dash toward character while time remains.
   * @returns {boolean} true if in attack move this tick.
   */
  attackMove(now) {
    if (!(this.attacking && now < this.attackUntil)) return false;
    const c = this.world?.character;
    let dir = this._dir ?? -1;
    if (c) dir = c.x + c.width / 2 < this.x + this.width / 2 ? -1 : 1;
    this.x += dir * this.attackSpeed;
    this.state = "attack";
    this.clampToPatrol();
    return true;
  }

  /**
   * Starts a new attack if cooldown elapsed.
   * @returns {boolean} true if attack started.
   */
  _maybeStartAttack(now) {
    if (this.attacking) {
      if (now >= this.attackUntil) this.attacking = false;
      return false;
    }
    if (now - this.lastAttackAt >= this.attackEveryMs) {
      this.startAttack();
      return true;
    }
    return false;
  }

  /**
   * Patrol step left/right and flip at bounds.
   */
  patrolStep() {
    this.state = "walk";
    const step = (this._dir ?? -1) * this.speed;
    this.x += step;
    if (this.x <= this.patrolMinX) {
      this.x = this.patrolMinX;
      this._dir = 1;
    }
    if (this.x + this.width >= this.patrolMaxX) {
      this.x = this.patrolMaxX - this.width;
      this._dir = -1;
    }
  }

  /**
   * Begins the timed attack window.
   */
  startAttack() {
    this.attacking = true;
    this.lastAttackAt = Date.now();
    this.attackUntil = this.lastAttackAt + this.attackDuration;
    this.state = "attack";
  }

  /**
   * Keeps boss inside patrol corridor.
   */
  clampToPatrol() {
    if (this.x < this.patrolMinX) this.x = this.patrolMinX;
    if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
  }

  /**
   * Applies damage, plays SFX, updates healthbar, switches to death.
   */
  takeHit(damage = 10) {
    if (this.dead || this.dying) return;
    const s = window.SFX?.bossHurt;
    try {
      if (s) {
        s.currentTime = 0;
        s.volume = window.getEffectiveVolume();
        s.play();
      }
    } catch {}
    this.energy = Math.max(0, this.energy - damage);
    this.healthBar?.setPercentage((this.energy / this.maxEnergy) * 100);
    if (this.energy <= 0) this.die();
    else this.hurtUntil = Date.now() + this.hurtMs;
  }

  /**
   * Enters death sequence and stops future attacks/spawns.
   */
  die() {
    if (this.dead || this.dying) return;
    this.dead = true;
    this.dying = true;
    this.state = "die";
    this.deathIndex = 0;
    this.deathDone = false;
    this.fadeStartAt = 0;
    this.lastAttackAt = Infinity;
    this.attacking = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  /**
   * Ensures Chick is ready, then spawns chicks periodically.
   */
  startSpawning() {
    if (this.spawnInterval || this.dead) return;
    const ensure = () => {
      if (typeof Chick === "undefined") return void setTimeout(ensure, 200);
      this.spawnInterval = setInterval(() => this.spawnChick(), 6000);
    };
    ensure();
  }

  /**
   * Spawns one chick at boss mid-X, starting to fall.
   */
  spawnChick() {
    if (!this.world || this.dead) return;
    const ground = this.world?.character?.groundBottom || 417;
    const midX = this.x + this.width / 2;
    const spawnY = Math.min(this.y + this.height - 30, ground - 90);
    const chick = new Chick(0, 0.6 + Math.random() * 0.6);
    chick.world = this.world;
    chick.x = Math.floor(midX - chick.width / 2);
    chick.startFall(spawnY);
    chick.otherDirection = true;
    this.world.level.enemies.push(chick);
  }

  /**
   * Stops boss timers (anim/attack/spawn/move if present).
   */
  freeze() {
    ["walkInterval", "attackInterval", "spawnInterval", "animInterval", "moveInterval"].forEach((k) => {
      if (this[k]) {
        clearInterval(this[k]);
        this[k] = null;
      }
    });
  }
}
