/**
 * Base class for movable, physics-affected drawable objects.
 * Handles simple gravity, collisions, health/damage, sprite animation, and movement.
 * @extends DrawableObjects
 */
class MovableObjects extends DrawableObjects {
  /** Horizontal movement speed (world units per tick). @type {number} */
  speed = 0.15;

  /** Whether the sprite is facing the opposite direction (for mirroring). @type {boolean} */
  otherDirection = false;

  /** Current vertical velocity; positive values move upward (y decreases). @type {number} */
  speedY = 0;

  /** Constant vertical acceleration applied each tick (gravity). @type {number} */
  acceleration = 2.3;

  /** Current health/energy (0..100). @type {number} */
  energy = 100;

  /** Timestamp of the last successful hit (ms since epoch). @type {number} */
  lastHit = 0;

  /**
   * Applies gravity by updating vertical position/velocity on a fixed interval (~33 fps).
   * No-ops while the world is paused.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.world?.paused) return;
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 33);
  }

  /**
   * Determines if the object is considered above ground.
   * Throwable objects are always treated as airborne.
   * For others, compares the current y against the ground threshold (274).
   * @returns {boolean}
   */
  isAboveGround() {
    if (this instanceof ThrowableObjects) {
      return true;
    } else {
      return this.y < 274;
    }
  }

  /**
   * Basic AABB overlap check against another object.
   * @param {{x:number,y:number,width:number,height:number}} mo - The other object to test against.
   * @returns {boolean} True if bounding boxes overlap; otherwise false.
   */
  isColliding(mo) {
    return this.x + this.width > mo.x && this.y + this.height > mo.y && this.x < mo.x && this.y < mo.y + mo.height;
  }

  /**
   * Applies a standard hit: reduces energy by 4 and records hit time if still alive.
   * @returns {void}
   */
  hit() {
    this.energy -= 4;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  /**
   * Whether the object is in a brief post-hit "hurt" window.
   * @returns {boolean} True if last hit was within the past 0.6 seconds.
   */
  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit;
    timePassed = timePassed / 1000;
    return timePassed < 0.6;
  }

  /**
   * Whether the object has no remaining energy.
   * @returns {boolean}
   */
  isDead() {
    return this.energy == 0;
  }

  /**
   * Loads a list of image paths into the instance image cache.
   * @param {string[]} arr - Array of image source paths.
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * Advances a frame of a sprite animation, cycling through provided images.
   * @param {string[]} images - Ordered list of frame image paths (must be preloaded into imageCache).
   * @returns {void}
   */
  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }

  /**
   * Moves the object to the right by (speed - 3).
   * @returns {void}
   */
  moveRight() {
    this.x += this.speed - 3;
  }

  /**
   * Moves the object to the left by (speed - 3).
   * @returns {void}
   */
  moveLeft() {
    this.x -= this.speed - 3;
  }

  /**
   * Initiates a jump by setting the vertical speed, and plays a jump sound if available and unmuted.
   * @returns {void}
   */
  jump() {
    this.speedY = 20;

    if (!(window.getEffectiveVolume && window.getEffectiveVolume() === 0)) {
      if (typeof this.playJump === "function") {
        this.playJump();
      } else if (window.playSfx) {
        window.playSfx("jump");
      }
    }
  }
}
