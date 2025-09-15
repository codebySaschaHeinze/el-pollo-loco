/**
 * Throwable salsa bottle projectile with simple parabolic motion, rotation,
 * break animation, and optional SFX on impact.
 * @extends MovableObjects
 */
class ThrowableObjects extends MovableObjects {
  /** Continuous rotation angle (radians). */ angle = 0;
  /** Interval id for horizontal movement.  */ moveInterval = null;
  /** Whether the bottle is in breaking animation. */ breaking = false;
  /** Timestamp when breaking started. */ brokenAt = 0;
  /** Splash animation duration (ms).    */ breakDuration = 600;
  /** True once the projectile dealt damage. */ didDamage = false;
  /** Optional horizontal velocity hint (World may set this). */ vx = undefined;

  /** Splash frames. */
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
      let vx = typeof this.vx === "number" ? this.vx : typeof this.speedX === "number" ? this.speedX : 8;
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
    if (a) {
      try {
        a.currentTime = 0;
        a.volume = window.getEffectiveVolume();
        a.play();
      } catch {}
    }
  }

  /**
   * Draw flight (rotating) or splash frames; break on ground contact.
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    if (this.world?.paused) return;

    if (this.breaking) {
      const t = Math.min((Date.now() - this.brokenAt) / this.breakDuration, 1);
      const idx = Math.min(Math.floor(t * this.IMAGES_BREAK.length), this.IMAGES_BREAK.length - 1);
      const frame = this.IMAGES_BREAK[idx],
        img = this.imageCache[frame];
      if (img) {
        ctx.save();
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
  }

  /** Stop timers (used by World.freezeAll). */
  freeze() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
  }
}
