/**
 * Small chicken enemy variant with a falling intro state and basic walking animation.
 * Starts falling from a given Y, lands on the ground line, then resumes regular movement logic.
 * @extends Chicken
 */
class Chick extends Chicken {
  /** Walking animation frames for the chick. @type {string[]} */
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  /**
   * Creates a chick at a starting X with optional initial speed.
   * @param {number} [xStart=0] - Initial horizontal position.
   * @param {number|null} [speed=null] - Initial horizontal speed (if null, parent default applies).
   */
  constructor(xStart = 0, speed = null) {
    super(xStart, speed);
    this.width = 28;
    this.height = 38;
    this.loadImages(this.IMAGES_WALKING);
    this.falling = false;
    this.otherDirection = true;
  }

  /**
   * Puts the chick into a falling state from a given Y, enabling gravity until it hits the ground.
   * @param {number} startY - The vertical position from which the chick begins to fall.
   * @returns {void}
   */
  startFall(startY) {
    this.y = startY;
    this.speed = 1;
    this.speedY = -5;
    this.applyGravity();
    this.falling = true;
  }

  /**
   * Updates chick behavior:
   * - If falling, apply gravity until landing, then transition to walking with randomized speed.
   * - Otherwise, defer to the parent update (regular movement/animation).
   * @returns {void}
   */
  update() {
    if (this.dead) return;

    if (this.falling) {
      const ground = this.world?.character?.groundBottom || 420;
      if (this.y + this.height >= ground) {
        this.y = ground - this.height;

        this.speed = 0.6 + Math.random() * 0.6;
        this.otherDirection = true;
        this.falling = false;
      }
      return;
    }

    super.update();
  }

  /**
   * Indicates whether the chick is above the ground line (used for gravity/jump logic).
   * @returns {boolean}
   */
  isAboveGround() {
    const ground = this.world?.character?.groundBottom || 417;
    return this.y + this.height < ground;
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
