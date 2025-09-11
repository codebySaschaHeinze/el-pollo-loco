/**
 * Throwable salsa bottle projectile with simple parabolic motion, rotation,
 * break animation, and optional SFX on impact.
 * @extends MovableObjects
 */
class ThrowableObjects extends MovableObjects {
  /** Continuous rotation angle (radians). @type {number} */
  angle = 0;

  /** Interval id for horizontal movement. @type {number|null} */
  moveInterval = null;

  /** Whether the bottle is currently in its breaking/splash animation. @type {boolean} */
  breaking = false;

  /** Timestamp (ms) when breaking started. @type {number} */
  brokenAt = 0;

  /** Splash animation total duration (ms). @type {number} */
  breakDuration = 600;

  /** Set once the projectile has already dealt damage. @type {boolean} */
  didDamage = false;

  /**
   * Splash animation frames shown over {@link breakDuration}.
   * @type {string[]}
   */
  IMAGES_BREAK = [
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  /**
   * Creates a throwable bottle at (x, y), preloads splash frames, and starts its flight.
   * @param {number} x - Initial world x-coordinate.
   * @param {number} y - Initial world y-coordinate.
   */
  constructor(x, y) {
    super().loadImage("assets/imgs/6_salsa_bottle/salsa_bottle.png");
    this.loadImages(this.IMAGES_BREAK);
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 40;
    this.throw();
  }

  /**
   * Starts the projectile motion: upward vertical speed with gravity and
   * a fixed-rate horizontal advance.
   * @returns {void}
   */
  throw() {
    this.speedY = 15;
    this.applyGravity();
    this.moveInterval = setInterval(() => {
      if (this.world?.paused) return;
      this.x += 30;
    }, 50);
  }

  /**
   * Triggers the breaking state: stop motion, start splash timing, and play SFX (if available).
   * Idempotent; subsequent calls are ignored while already breaking.
   * @returns {void}
   */
  break() {
    if (this.breaking) return;
    this.breaking = true;
    this.brokenAt = Date.now();
    this.speedY = 0;
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
      const a = window.SFX?.bottleBreak;
      if (a) {
        try {
          a.currentTime = 0;
          a.volume = window.getEffectiveVolume();
          a.play();
        } catch (_) {}
      }
    }
  }

  /**
   * Draws the bottle or its splash animation.
   * - While breaking: renders splash frames over time and flags as gone when finished.
   * - In flight: rotates and draws the bottle; triggers break on ground contact.
   * No-ops while the world is paused.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    if (this.world?.paused) return;

    if (this.breaking) {
      const t = Math.min((Date.now() - this.brokenAt) / this.breakDuration, 1);
      const idx = Math.min(Math.floor(t * this.IMAGES_BREAK.length), this.IMAGES_BREAK.length - 1);
      const frame = this.IMAGES_BREAK[idx];
      const img = this.imageCache[frame];
      if (img) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.restore();
      }
      if (t >= 1) this.gone = true;
      return;
    }

    const ground = this.world?.character?.groundBottom || 417;
    if (this.y + this.height >= ground) {
      this.y = ground - this.height + 10;
      this.break();
      return;
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.drawImage(this.img, 0, 0, this.width, this.height);
    ctx.restore();
    this.angle += 0.25;
  }
}
