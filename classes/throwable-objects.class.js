/**
 * Throwable salsa bottle projectile with parabolic motion, rotation,
 * break animation, and optional SFX on impact.
 * @extends MovableObjects
 */
class ThrowableObjects extends MovableObjects {
  angle = 0;
  moveInterval = null;
  breaking = false;
  brokenAt = 0;
  breakDuration = 600;
  didDamage = false;
  vx = undefined;

  IMAGES_BREAK = [
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  /**
   * Create a bottle at (x,y), preload splash frames, start flight.
   * @param {number} x
   * @param {number} y
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
   * Begin motion: upward impulse + gravity + timed horizontal ticks.
   * Uses this.vx (or speedX) each tick so World can flip direction.
   * @returns {void}
   */
  throw() {
    this.speedY = 15;
    this.applyGravity();
    this.moveInterval = setInterval(() => {
      if (this.world?.paused) return;
      let vx = typeof this.vx === "number" ? this.vx : typeof this.speedX === "number" ? this.speedX : 15;
      if (this.otherDirection && vx > 0) vx = -vx;
      this.x += vx;
      this.angle += vx >= 0 ? 0.25 : -0.25;
    }, 50);
  }

  /**
   * Enter breaking state, stop motion, start splash SFX/clock.
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
    }
    const a = window.SFX?.bottleBreak;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.volume = window.getEffectiveVolume();
      a.play();
    } catch {}
  }

  /**
   * Draw flight (rotating) or splash; break on ground contact.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    if (this.world?.paused) return;
    if (this.breaking) {
      this.renderSplash(ctx);
      return;
    }
    if (this.checkGround()) return;
    this.renderBottle(ctx);
  }

  /**
   * Renders splash frames and marks the bottle gone when finished.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  renderSplash(ctx) {
    const t = Math.min((Date.now() - this.brokenAt) / this.breakDuration, 1);
    const idx = Math.min(Math.floor(t * this.IMAGES_BREAK.length), this.IMAGES_BREAK.length - 1);
    const img = this.imageCache[this.IMAGES_BREAK[idx]];
    if (img) {
      ctx.save();
      ctx.drawImage(img, this.x, this.y, this.width, this.height);
      ctx.restore();
    }
    if (t >= 1) this.gone = true;
  }

  /**
   * Checks/handles ground impact (breaks bottle). Returns true if handled.
   * @returns {boolean}
   */
  checkGround() {
    const ground = this.world?.character?.groundBottom || 417;
    if (this.y + this.height < ground) return false;
    this.y = ground - this.height + 10;
    this.break();
    return true;
  }

  /**
   * Renders the rotating bottle sprite in flight.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  renderBottle(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.drawImage(this.img, 0, 0, this.width, this.height);
    ctx.restore();
  }

  /** Stop timers (used by World.freezeAll). */
  freeze() {
    if (!this.moveInterval) return;
    clearInterval(this.moveInterval);
    this.moveInterval = null;
  }
}
