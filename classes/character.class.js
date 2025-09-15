/**
 * Main player character with movement, physics, combat states, items, animations, and SFX hooks.
 * Handles keyboard movement, gravity (via parent), damage/invulnerability, death anim/ascend,
 * sprite state machine (walk/jump/hurt/idle/dead), and footstep/jump sounds.
 * @extends MovableObjects
 */
class Character extends MovableObjects {
  y = 180;
  speed = 6;
  energy = 100;
  lastHitAt = 0;
  invulnMs = 700;
  hurtMs = 350;
  dead = false;
  moveInterval = null;
  animInterval = null;
  deathDone = false;
  deathIndex = 0;
  ascendStartAt = 0;
  ascendDuration = 2000;
  ascendDistance = 300;
  bodyBaseY = 0;
  lastVisibleDeadIdx = 0;
  bottles = 0;
  maxBottles = 10;
  coins = 0;
  maxCoins = 999;
  stepPlaying = false;
  stompGraceMs = 180;
  lastStompAt = 0;
  idleTimeoutMs = 5000;
  lastActionAt = Date.now();
  sleeping = false;
  _sleepImagesLoaded = false;
  currentImage = 0;
  world;

  IMAGES_WALKING = [
    "assets/imgs/2_character_pepe/2_walk/w-21.png",
    "assets/imgs/2_character_pepe/2_walk/w-22.png",
    "assets/imgs/2_character_pepe/2_walk/w-23.png",
    "assets/imgs/2_character_pepe/2_walk/w-24.png",
    "assets/imgs/2_character_pepe/2_walk/w-25.png",
    "assets/imgs/2_character_pepe/2_walk/w-26.png",
  ];

  IMAGES_JUMPING = [
    "assets/imgs/2_character_pepe/3_jump/j-31.png",
    "assets/imgs/2_character_pepe/3_jump/j-32.png",
    "assets/imgs/2_character_pepe/3_jump/j-33.png",
    "assets/imgs/2_character_pepe/3_jump/j-34.png",
    "assets/imgs/2_character_pepe/3_jump/j-35.png",
    "assets/imgs/2_character_pepe/3_jump/j-36.png",
    "assets/imgs/2_character_pepe/3_jump/j-37.png",
    "assets/imgs/2_character_pepe/3_jump/j-38.png",
    "assets/imgs/2_character_pepe/3_jump/j-39.png",
  ];

  IMAGES_DEAD = [
    "assets/imgs/2_character_pepe/5_dead/d-51.png",
    "assets/imgs/2_character_pepe/5_dead/d-52.png",
    "assets/imgs/2_character_pepe/5_dead/d-53.png",
    "assets/imgs/2_character_pepe/5_dead/d-54.png",
    "assets/imgs/2_character_pepe/5_dead/d-55.png",
    "assets/imgs/2_character_pepe/5_dead/d-56.png",
  ];

  IMAGES_HURT = [
    "assets/imgs/2_character_pepe/4_hurt/h-41.png",
    "assets/imgs/2_character_pepe/4_hurt/h-42.png",
    "assets/imgs/2_character_pepe/4_hurt/h-43.png",
  ];

  IMAGES_IDLE = [
    "assets/imgs/2_character_pepe/1_idle/idle/i-1.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-2.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-3.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-4.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-5.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-6.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-7.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-8.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-9.png",
    "assets/imgs/2_character_pepe/1_idle/idle/i-10.png",
  ];

  IMAGES_SLEEP = [
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-11.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-12.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-13.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-14.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-15.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-16.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-17.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-18.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-19.png",
    "assets/imgs/2_character_pepe/1_idle/long_idle/i-20.png",
  ];

  /**
   * Create character, set physics/sprites, apply gravity, start loops.
   * @param {GameKeyboard|Keyboard} keyboard Input handler instance.
   */
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.keyboard = keyboard;
    this.initProps();
    this.loadSprites();
    this.applyGravity();
    this.animate();
  }

  /** Initialize dimensions, collisions and ground alignment. */
  initProps() {
    this.width = 85;
    this.height = 160;
    this.offset = { top: 90, right: 30, bottom: 10, left: 30 };
    this.groundBottom = 365 + 52;
    this.y = this.groundBottom - this.height;
    this.lastVisibleDeadIdx = this.IMAGES_DEAD.length - 4;
  }

  /** Preload sprite sheets used by the state machine. */
  loadSprites() {
    [this.IMAGES_WALKING, this.IMAGES_JUMPING, this.IMAGES_DEAD, this.IMAGES_HURT, this.IMAGES_IDLE].forEach((a) => this.loadImages(a));
  }

  /** Play jump SFX (respects volume). */
  playJump() {
    if (window.getEffectiveVolume && window.getEffectiveVolume() === 0) return;
    const a = window.SFX?.jump;
    if (!a) return;
    a.currentTime = 0;
    a.volume = window.getEffectiveVolume?.() ?? window.gameVolume ?? 1;
    a.play().catch(() => {});
  }

  /** True if currently invulnerable after a hit. */
  isInvulnerable() {
    return Date.now() - (this.lastHitAt || 0) < this.invulnMs;
  }

  /**
   * Apply damage unless invulnerable; triggers hurt SFX and death at 0.
   * @param {number} [damage=10]
   * @returns {boolean} True if damage applied.
   */
  hit(damage = 10) {
    if (this.isInvulnerable() || this.isDead?.()) return false;
    this.lastHitAt = Date.now();
    this.playHurtSfx();
    this.energy = Math.max(0, this.energy - damage);
    if (this.energy <= 0) this.die();
    return true;
  }

  /** Play hurt SFX safely. */
  playHurtSfx() {
    const s = window.SFX?.hurt;
    if (!s) return;
    try {
      s.currentTime = 0;
      s.volume = window.getEffectiveVolume?.() ?? 1;
      s.play();
    } catch {}
  }

  /** True while the "hurt" animation window is active. */
  isHurt() {
    return Date.now() - (this.lastHitAt || 0) < this.hurtMs;
  }

  /** Mark as dead and stop movement physics. */
  die() {
    if (this.dead) return;
    this.dead = true;
    this.y = this.groundBottom - this.height;
    this.speedY = 0;
    this.speed = 0;
    this.acceleration = 0;
  }

  /** Dead or out of energy. */
  isDead() {
    return this.dead || this.energy <= 0;
  }

  /** True if above ground (dead chars are never above). */
  isAboveGround() {
    return !this.isDead() && this.y + this.height < this.groundBottom;
  }

  /** Start movement and animation tick loops. */
  animate() {
    this.moveInterval = setInterval(() => this.tickMove(), 1000 / 100);
    this.animInterval = setInterval(() => this.tickAnim(), 100);
  }

  /** Movement loop: input → motion, jump, camera. */
  tickMove() {
    if (this.isDead() || this.world?.paused) return;
    const kb = this._kb();
    if (this._anyKey(kb)) this.markActivity();
    if (kb?.RIGHT && this.x < this.world?.level?.level_end_x) {
      this.moveRight();
      this.otherDirection = false;
      this.markActivity();
    }
    if (kb?.LEFT && this.x > 0) {
      this.moveLeft();
      this.otherDirection = true;
      this.markActivity();
    }
    if (kb?.UP && !this.isAboveGround()) {
      this.pauseStep();
      this.jump();
      this.markActivity();
    }
    if (this.world) this.world.camera_x = -this.x + 250;
  }

  /** Animation loop: death, sleep/idle/walk/jump/hurt state selection. */
  tickAnim() {
    if (this.isDead()) return this.tickDeathAnim();
    if (this.world?.paused) return;
    const kb = this._kb(),
      moving = !!(kb?.RIGHT || kb?.LEFT),
      onGround = !this.isAboveGround();
    if (!moving && onGround && !this.isHurt?.() && !(this.speedY > 0)) {
      if (this.isInactive()) this.sleeping = true;
    } else if (moving || kb?.UP || kb?.DOWN || kb?.SPACE) this.wakeUp();
    if (this.isHurt?.()) this.playAnimation(this.IMAGES_HURT);
    else if (!onGround || this.speedY > 0) this.playAnimation(this.IMAGES_JUMPING);
    else if (moving) this.playAnimation(this.IMAGES_WALKING);
    else if (this.sleeping) {
      this.ensureSleepSprites();
      this.playAnimation(this.IMAGES_SLEEP?.length ? this.IMAGES_SLEEP : this.IMAGES_IDLE);
    } else this.playAnimation(this.IMAGES_IDLE);
  }

  /** Advance death animation; stop loop when final frame is reached. */
  tickDeathAnim() {
    if (this.deathDone) return;
    const last = this.lastVisibleDeadIdx,
      idx = Math.min(this.deathIndex, last);
    const frame = this.IMAGES_DEAD[idx];
    if (frame) this.img = this.imageCache[frame];
    this.deathIndex++;
    if (this.deathIndex > last) {
      this.deathDone = true;
      this.img = this.imageCache[this.IMAGES_DEAD[last]];
      clearInterval(this.animInterval);
    }
  }

  /** Ensure sleep sheet is loaded once. */
  ensureSleepSprites() {
    if (this._sleepImagesLoaded || !this.IMAGES_SLEEP?.length) return;
    this.loadImages(this.IMAGES_SLEEP);
    this._sleepImagesLoaded = true;
  }

  /** Draw the character; when dead+finished, draw fade&ascend. */
  draw(ctx) {
    if (this.dead && this.deathDone) return this.drawDeadAscend(ctx);
    super.draw(ctx);
  }

  /** Dead fade & ascend effect; flags entity as gone at the end. */
  drawDeadAscend(ctx) {
    if (!this.ascendStartAt) {
      this.ascendStartAt = Date.now();
      this.bodyBaseY = this.y;
    }
    const t = Math.min((Date.now() - this.ascendStartAt) / this.ascendDuration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    this.y = this.bodyBaseY - this.ascendDistance * ease;
    const alpha = 1 - t;
    const last = this.IMAGES_DEAD[this.lastVisibleDeadIdx],
      cached = this.imageCache[last];
    if (cached) this.img = cached;
    ctx.save();
    ctx.globalAlpha = alpha;
    super.draw(ctx);
    ctx.restore();
    if (t >= 1) this.gone = true;
  }

  /** True when falling down (used for stomp logic). */
  fallingDown() {
    return this.speedY < 0;
  }

  /**
   * Bounce off an enemy (vertical impulse) and play jump SFX.
   * @param {{y:number,height:number}} enemy Hit enemy object.
   * @param {number} [strength=15] Upward speed.
   */
  bounceOn(enemy, strength = 15) {
    this.y = enemy.y - this.height + 20;
    this.speedY = strength;
    this.playJump();
  }

  /** Bottle availability for throwing. */
  canThrowBottle() {
    return this.bottles > 0;
  }

  /** Consume one bottle if available. */
  useBottle() {
    if (this.bottles <= 0) return false;
    this.bottles -= 1;
    return true;
  }

  /** Add bottles (capped). */
  addBottle(n = 1) {
    this.bottles = Math.min(this.maxBottles, this.bottles + n);
  }

  /** Add coins (never below zero). */
  addCoin(n = 1) {
    this.coins = Math.max(0, (this.coins || 0) + n);
  }

  /** Start footstep SFX if not playing. */
  playStep() {
    const a = window.SFX?.step;
    if (!a || this.stepPlaying) return;
    a.currentTime = 0;
    a.volume = window.getEffectiveVolume?.() ?? 1;
    a.play().catch(() => {});
    this.stepPlaying = true;
  }

  /** Pause footstep SFX if playing. */
  pauseStep() {
    const a = window.SFX?.step;
    if (!a || !this.stepPlaying) return;
    a.pause();
    this.stepPlaying = false;
  }

  /** Update footstep SFX according to motion/ground/life/pause. */
  updateStepSound() {
    const kb = this.world?.keyboard,
      moving = !!(kb?.LEFT || kb?.RIGHT);
    const play = moving && !this.isAboveGround() && !this.isDead() && !this.world?.paused;
    play ? this.playStep() : this.pauseStep();
  }

  /** Remember a successful stomp; starts short grace window. */
  registerStomp() {
    this.lastStompAt = Date.now();
  }

  /** True while stomp grace is active. */
  isInStompGrace() {
    return Date.now() - (this.lastStompAt || 0) < this.stompGraceMs;
  }

  /** Stop timers and step sound. */
  freeze() {
    this.pauseStep?.();
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
  }

  /** Mark activity and wake if sleeping. */
  markActivity() {
    this.lastActionAt = Date.now();
    if (this.sleeping) this.wakeUp();
  }

  /** Inactive when idle threshold exceeded. */
  isInactive() {
    return Date.now() - (this.lastActionAt || 0) >= this.idleTimeoutMs;
  }

  /** Exit sleep state. */
  wakeUp() {
    this.sleeping = false;
  }

  /** Get current keyboard (world or local). */
  _kb() {
    return this.world?.keyboard || this.keyboard;
  }

  /** True if any relevant input is held. */
  _anyKey(kb) {
    return !!(kb?.LEFT || kb?.RIGHT || kb?.UP || kb?.DOWN || kb?.SPACE);
  }
}
