/**
 * Main player character with movement, physics, combat states, item counts, animations, and SFX hooks.
 * Handles keyboard-driven movement, gravity (via parent), damage/invulnerability, death animation/ascend,
 * sprite state machine (walk/jump/hurt/idle/dead), and footsteps/jump sounds.
 * @extends MovableObjects
 */
class Character extends MovableObjects {
  /** Baseline y before gravity adjustment; actual y is set to groundBottom - height in ctor. @type {number} */
  y = 180;
  /** Horizontal movement speed. @type {number} */
  speed = 6;
  /** Current health (0..100). @type {number} */
  energy = 100;
  /** Timestamp (ms) of the last damaging hit. @type {number} */
  lastHitAt = 0;
  /** Invulnerability window after a hit (ms). @type {number} */
  invulnMs = 700;
  /** "Hurt" state duration (ms) for animation. @type {number} */
  hurtMs = 350;
  /** Whether the character has died. @type {boolean} */
  dead = false;
  /** Interval id for movement loop. @type {number|null} */
  moveInterval = null;
  /** Interval id for animation loop. @type {number|null} */
  animInterval = null;
  /** Whether the death animation finished its visible frames. @type {boolean} */
  deathDone = false;
  /** Current index into IMAGES_DEAD during death animation. @type {number} */
  deathIndex = 0;
  /** Timestamp when the post-death ascend effect started. @type {number} */
  ascendStartAt = 0;
  /** Duration (ms) of the post-death ascend effect. @type {number} */
  ascendDuration = 2000;
  /** Total vertical distance of the post-death ascend effect. @type {number} */
  ascendDistance = 300;
  /** y-position recorded at the start of the ascend effect. @type {number} */
  bodyBaseY = 0;
  /** Last index of a visible dead frame image. @type {number} */
  lastVisibleDeadIdx = 0;
  /** Number of throwable bottles in inventory. @type {number} */
  bottles = 0;
  /** Max bottles the character can carry. @type {number} */
  maxBottles = 10;
  /** Coin count. @type {number} */
  coins = 0;
  /** Coin counter cap for HUD formatting. @type {number} */
  maxCoins = 999;
  /** Whether footstep SFX is currently playing. @type {boolean} */
  stepPlaying = false;

  stompGraceMs = 180;

  lastStompAt = 0;

  /** Walking animation frames. @type {string[]} */
  IMAGES_WALKING = [
    "assets/imgs/2_character_pepe/2_walk/w-21.png",
    "assets/imgs/2_character_pepe/2_walk/w-22.png",
    "assets/imgs/2_character_pepe/2_walk/w-23.png",
    "assets/imgs/2_character_pepe/2_walk/w-24.png",
    "assets/imgs/2_character_pepe/2_walk/w-25.png",
    "assets/imgs/2_character_pepe/2_walk/w-26.png",
  ];

  /** Jump animation frames. @type {string[]} */
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

  /** Death animation frames. @type {string[]} */
  IMAGES_DEAD = [
    "assets/imgs/2_character_pepe/5_dead/d-51.png",
    "assets/imgs/2_character_pepe/5_dead/d-52.png",
    "assets/imgs/2_character_pepe/5_dead/d-53.png",
    "assets/imgs/2_character_pepe/5_dead/d-54.png",
    "assets/imgs/2_character_pepe/5_dead/d-55.png",
    "assets/imgs/2_character_pepe/5_dead/d-56.png",
  ];

  /** Hurt animation frames. @type {string[]} */
  IMAGES_HURT = [
    "assets/imgs/2_character_pepe/4_hurt/h-41.png",
    "assets/imgs/2_character_pepe/4_hurt/h-42.png",
    "assets/imgs/2_character_pepe/4_hurt/h-43.png",
  ];

  /** Idle animation frames. @type {string[]} */
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

  /** Current animation frame cursor. @type {number} */
  currentImage = 0;

  /** Back-reference to the world, set externally. @type {World|undefined} */
  world;

  /**
   * Creates the character, loads sprites, sets collisions/ground, applies gravity, and starts animation loops.
   * @param {Keyboard} keyboard - The keyboard input source controlling movement and jump.
   */
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.width = 85;
    this.height = 160;
    this.offset = { top: 90, right: 30, bottom: 10, left: 30 };
    this.groundBottom = 365 + 52;
    this.y = this.groundBottom - this.height;
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.lastVisibleDeadIdx = this.IMAGES_DEAD.length - 4;
    this.applyGravity();
    this.keyboard = keyboard;
    this.animate();
  }

  /**
   * Plays the jump sound effect if available and not muted.
   * @returns {void}
   */
  playJump() {
    if (window.getEffectiveVolume && window.getEffectiveVolume() === 0) return;

    const a = window.SFX?.jump;
    if (!a) return;
    a.currentTime = 0;
    a.volume = window.getEffectiveVolume ? window.getEffectiveVolume() : window.gameVolume ?? 1;
    a.play().catch(() => {});
  }

  /**
   * Whether the character is currently invulnerable after a recent hit.
   * @returns {boolean}
   */
  isInvulnerable() {
    return Date.now() - (this.lastHitAt || 0) < this.invulnMs;
  }

  /**
   * Applies damage if not invulnerable; plays hurt SFX, updates energy, and triggers death if needed.
   * @param {number} [damage=10] - Amount of energy to subtract.
   * @returns {boolean} True if damage was applied; false if ignored (invulnerable/dead).
   */
  hit(damage = 10) {
    if (this.isInvulnerable() || (this.isDead && this.isDead())) return false;
    this.lastHitAt = Date.now();
    const s = window.SFX?.hurt;
    if (s) {
      try {
        s.currentTime = 0;
        s.volume = window.getEffectiveVolume();
        s.play();
      } catch (_) {}
    }
    this.energy = Math.max(0, this.energy - damage);
    if (this.energy <= 0) {
      this.die();
    }

    return true;
  }

  /**
   * Whether the character is within the "hurt" animation window.
   * @returns {boolean}
   */
  isHurt() {
    return Date.now() - (this.lastHitAt || 0) < this.hurtMs;
  }

  /**
   * Marks the character as dead and cancels movement by zeroing physics parameters.
   * @returns {void}
   */
  die() {
    if (this.dead) return;
    this.dead = true;
    this.y = this.groundBottom - this.height;
    this.speedY = 0;
    this.speed = 0;
    this.acceleration = 0;
  }

  /**
   * Whether the character is dead or out of energy.
   * @returns {boolean}
   */
  isDead() {
    return this.dead || this.energy <= 0;
  }

  /**
   * Whether the character is above the ground plane (used for jump state).
   * Dead characters are not considered above ground.
   * @returns {boolean}
   */
  isAboveGround() {
    if (this.isDead()) return false;
    return this.y + this.height < this.groundBottom;
  }

  /**
   * Starts movement and animation intervals:
   * - Movement loop handles keyboard input and camera follow.
   * - Animation loop selects appropriate sprite set based on state.
   * @returns {void}
   */
  animate() {
    this.moveInterval = setInterval(() => {
      if (this.isDead()) return;
      if (this.world?.paused) return;

      if (this.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
      }
      if (this.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
      }
      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.pauseStep();
        this.jump();
      }
      this.world.camera_x = -this.x + 250;
    }, 1000 / 100);
    this.animInterval = setInterval(() => {
      if (this.isDead()) {
        if (!this.deathDone) {
          const lastIdx = this.lastVisibleDeadIdx;
          const idx = Math.min(this.deathIndex, lastIdx);
          const frame = this.IMAGES_DEAD[idx];
          if (frame) this.img = this.imageCache[frame];
          this.deathIndex++;
          if (this.deathIndex > lastIdx) {
            this.deathDone = true;
            this.img = this.imageCache[this.IMAGES_DEAD[lastIdx]];
            clearInterval(this.animInterval);
          }
        }
        return;
      }
      if (this.world?.paused) return;

      if (this.isHurt && this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround() || this.speedY > 0) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.playAnimation(this.IMAGES_WALKING);
      } else {
        this.playAnimation(this.IMAGES_IDLE);
      }
    }, 100);
  }

  /**
   * Draws the character; if dead and death animation finished, performs a fade-and-ascend effect then flags as gone.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    if (this.dead && this.deathDone) {
      if (!this.ascendStartAt) {
        this.ascendStartAt = Date.now();
        this.bodyBaseY = this.y;
      }
      const elapsed = Date.now() - this.ascendStartAt;
      const t = Math.min(elapsed / this.ascendDuration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const alpha = 1 - t;
      this.y = this.bodyBaseY - this.ascendDistance * ease;
      const last = this.IMAGES_DEAD[this.lastVisibleDeadIdx];
      const cached = this.imageCache[last];
      if (cached) this.img = cached;
      ctx.save();
      ctx.globalAlpha = alpha;
      super.draw(ctx);
      ctx.restore();

      if (t >= 1) this.gone = true;

      return;
    }

    super.draw(ctx);
  }

  /**
   * Helper indicating the vertical velocity is downward (used for stomp logic in collisions).
   * @returns {boolean}
   */
  fallingDown() {
    return this.speedY < 0;
  }

  /**
   * Bounces the character off an enemy, adding vertical speed and playing jump SFX.
   * @param {{y:number,height:number}} enemy - The enemy collided with.
   * @param {number} [strength=15] - Upward speed to apply.
   * @returns {void}
   */
  bounceOn(enemy, strength = 15) {
    this.y = enemy.y - this.height + 20;
    this.speedY = strength;
    this.playJump();
  }

  /**
   * Whether at least one bottle is available to throw.
   * @returns {boolean}
   */
  canThrowBottle() {
    return this.bottles > 0;
  }

  /**
   * Consumes a bottle if available.
   * @returns {boolean} True if a bottle was used; otherwise false.
   */
  useBottle() {
    if (this.bottles > 0) {
      this.bottles -= 1;
      return true;
    }
    return false;
  }

  /**
   * Adds bottles to inventory, capped at maxBottles.
   * @param {number} [n=1] - How many to add.
   * @returns {void}
   */
  addBottle(n = 1) {
    this.bottles = Math.min(this.maxBottles, this.bottles + n);
  }

  /**
   * Adds coins to the counter (never below zero).
   * @param {number} [n=1] - How many coins to add (can be negative).
   * @returns {void}
   */
  addCoin(n = 1) {
    this.coins = Math.max(0, (this.coins || 0) + n);
  }

  /**
   * Starts footstep sound if not already playing and volume permits.
   * @returns {void}
   */
  playStep() {
    const a = window.SFX?.step;
    if (!a) return;
    if (!this.stepPlaying) {
      a.currentTime = 0;
      a.volume = window.getEffectiveVolume();
      a.play().catch(() => {});
      this.stepPlaying = true;
    }
  }

  /**
   * Pauses footstep sound if currently playing.
   * @returns {void}
   */
  pauseStep() {
    const a = window.SFX?.step;
    if (!a) return;
    if (this.stepPlaying) {
      a.pause();
      this.stepPlaying = false;
    }
  }

  /**
   * Updates footstep SFX state based on movement, ground contact, life state, and pause state.
   * @returns {void}
   */
  updateStepSound() {
    const kb = this.world?.keyboard;
    const moving = !!(kb?.LEFT || kb?.RIGHT);
    const onGround = !this.isAboveGround();
    const alive = !(this.isDead?.() || this.dead);
    const paused = !!this.world?.paused;
    if (moving && onGround && alive && !paused) {
      this.playStep();
    } else {
      this.pauseStep();
    }
  }

  /**
   * Marks a successful stomp and starts a short grace window.
   * @returns {void}
   */
  registerStomp() {
    this.lastStompAt = Date.now();
  }

  /**
   * True while stomp grace is active.
   * @returns {boolean}
   */
  isInStompGrace() {
    return Date.now() - (this.lastStompAt || 0) < this.stompGraceMs;
  }

  /**
   * Stops movement/animation timers and step sound.
   * @returns {void}
   */
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
}
