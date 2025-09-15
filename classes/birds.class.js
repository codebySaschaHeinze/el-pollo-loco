/**
 * Ambient bird sprite that moves horizontally across the sky and wraps around the world width.
 * Uses random sprite selection, speed, and vertical position to create variety.
 * @extends MovableObjects
 */
class Birds extends MovableObjects {
  static IMAGES = [
    "assets/imgs/5_background/layers/5_birds/1.png",
    "assets/imgs/5_background/layers/5_birds/2.png",
    "assets/imgs/5_background/layers/5_birds/3.png",
    "assets/imgs/5_background/layers/5_birds/4.png",
    "assets/imgs/5_background/layers/5_birds/1.png",
    "assets/imgs/5_background/layers/5_birds/2.png",
    "assets/imgs/5_background/layers/5_birds/3.png",
    "assets/imgs/5_background/layers/5_birds/4.png",
  ];

  /**
   * Spawns a flock of birds distributed across the world width with slight jitter.
   * @param {number} n - Number of birds to spawn.
   * @param {number} worldWidth - Total width of the world for distribution and wrapping.
   * @param {number} [yMin=20] - Minimum vertical position for birds.
   * @param {number} [yMax=100] - Maximum vertical position for birds.
   * @returns {Birds[]} Array of spawned bird instances.
   * @static
   */
  static spawnFlock(n, worldWidth, yMin = 20, yMax = 100) {
    const arr = [];
    const stride = worldWidth / (n + 1);
    for (let i = 0; i < n; i++) {
      const jitter = (Math.random() - 0.5) * stride * 0.4;
      const x = Math.max(-200, Math.min(worldWidth + 200, Math.floor((i + 1) * stride + jitter)));
      const b = new Birds(worldWidth, x);
      b.y = yMin + Math.random() * (yMax - yMin);
      arr.push(b);
    }
    return arr;
  }

  /**
   * Creates a single bird with random sprite, size, speed, and altitude.
   * @param {number} worldWidth - Total width of the world for horizontal wrap logic.
   * @param {number} [xStart=0] - Initial horizontal position.
   */
  constructor(worldWidth, xStart = 0) {
    super();
    const src = Birds.IMAGES[(Math.random() * Birds.IMAGES.length) | 0];
    this.loadImage(src);

    this.worldWidth = worldWidth;

    this.width = 30 + Math.random() * 10;
    this.height = Math.floor(this.width * 0.3);
    this.x = xStart;
    this.y = 20 + Math.random() * 80;
    this.speed = 0.2 + Math.random() * 0.3;
    this.otherDirection = false;
  }

  /**
   * Updates position and performs wrap-around when passing the right boundary.
   * No-ops while the world is paused.
   * @returns {void}
   */
  update() {
    if (this.world?.paused) return;
    this.x += this.speed;

    if (this.x > this.worldWidth + this.width + 200) {
      this.x = -this.width - 200;
      this.y = 20 + Math.random() * 80;
      this.speed = 0.2 + Math.random() * 0.3;
    }
  }
}
