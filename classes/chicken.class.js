/**
 * Standard chicken enemy that walks left across the level,
 * animates through walk frames, and fades out when killed.
 * Re-spawns off-screen to the right when it leaves the view.
 * @extends MovableObjects
 */
class Chicken extends MovableObjects {
  /** Walk animation frames. @type {string[]} */
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];

  /** Current animation frame cursor. @type {number} */
  currentImage = 0;
  /** Sprite width. @type {number} */
  width = 48;
  /** Sprite height. @type {number} */
  height = 62;
  /** Whether the chicken is dead (fading). @type {boolean} */
  dead = false;

  /**
   * Creates a chicken at a starting X with optional initial speed.
   * @param {number} [xStart=0] - Initial horizontal position.
   * @param {number|null} [speed=null] - Initial horizontal speed (random if null).
   */
  constructor(xStart = 0, speed = null) {
    super().loadImage("assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);
    this.x = xStart;
    this.y = 365 + Math.random() * 10;
    this.speed = speed ?? 0.7 + Math.random() * 0.7;
    this.animate();
  }

  /**
   * Draws the chicken; if dead, draws with a fade-out based on elapsed time and
   * flags it as gone when fully faded.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
   * @returns {void}
   */
  draw(ctx) {
    if (!this.dead) {
      super.draw(ctx);
      return;
    }

    const elapsed = Date.now() - (this.deadAt || 0);
    const t = Math.min(elapsed / (this.fadeDuration || 2000), 1);
    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    super.draw(ctx);
    ctx.restore();
    if (t >= 1) this.gone = true;
  }

  /**
   * Marks the chicken as dead, stops walking animation, and swaps to dead sprite.
   * @returns {void}
   */
  die() {
    this.dead = true;
    this.speed = 0;
    this.deadAt = Date.now();
    this.fadeDuration = 1000;
    if (this.walkInterval) clearInterval(this.walkInterval);
    this.loadImage("assets/imgs/3_enemies_chicken/chicken_normal/2_dead/dead.png");
  }

  /**
   * Starts the walking animation loop unless the world is paused.
   * @returns {void}
   */
  animate() {
    if (this.world?.paused) return;
    this.walkInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }

  /**
   * Updates position moving left each tick; when exiting left boundary,
   * repositions to the right side with randomized speed and slight ground jitter.
   * No-op while dead.
   * @returns {void}
   */
  update() {
    if (this.dead) return;
    this.otherDirection = false;
    this.x -= this.speed;
    if (this.x < -this.width) {
      const worldEnd = this.world?.level?.level_end_x || 8000;
      this.x = worldEnd + 100 + Math.random() * 300;
      this.speed = 0.8 + Math.random() * 0.7;
      this.y = 365 + Math.random() * 10;
    }
  }

  /**
   * Stops walking animation timer.
   * @returns {void}
   */
  freeze() {
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
  }
}
