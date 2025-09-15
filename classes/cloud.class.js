/**
 * Cloud sprite that drifts left across the sky and wraps to the right side when off-screen.
 * Randomizes size, altitude, speed, and sprite image for visual variety.
 * @extends MovableObjects
 */
class Cloud extends MovableObjects {
  y = 10;
  width = Math.random() * 300 + 100;
  height = Math.random() * 80 + 30;

  /**
   * Available cloud sprite images.
   * @type {string[]}
   */
  IMAGES = [
    "assets/imgs/5_background/layers/4_clouds/1.png",
    "assets/imgs/5_background/layers/4_clouds/2.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/4.png",
    "assets/imgs/5_background/layers/4_clouds/5.png",
    "assets/imgs/5_background/layers/4_clouds/6.png",
    "assets/imgs/5_background/layers/4_clouds/7.png",
    "assets/imgs/5_background/layers/4_clouds/8.png",
    "assets/imgs/5_background/layers/4_clouds/9.png",
    "assets/imgs/5_background/layers/4_clouds/10.png",
  ];

  /**
   * Creates a cloud with random image, altitude, and speed.
   * @param {number} worldWidth - Total world width used for wrap-around repositioning.
   * @param {number|null} [xStart=null] - Optional initial x-position; if null, starts off-screen to the right.
   */
  constructor(worldWidth, xStart = null) {
    super();
    const rand = (arr) => arr[(Math.random() * arr.length) | 0];
    this.loadImage(rand(this.IMAGES));
    this.worldWidth = worldWidth;
    this.x = xStart ?? worldWidth + Math.random() * 200;
    this.y = 1 + Math.random() * 50;
    this.speed = 0.1 + Math.random() * 0.4;
    this.animate();
  }

  /**
   * Placeholder for potential per-frame animation logic (e.g., parallax tweaks).
   * @returns {void}
   */
  animate() {}

  /**
   * Advances the cloud leftward and wraps it to the right once off-screen.
   * Randomizes altitude and speed on wrap.
   * @returns {void}
   */
  update() {
    this.x -= this.speed;
    if (this.x < -this.width) {
      this.x = this.worldWidth + 50 + Math.random() * 200;
      this.y = 10 + Math.random() * 40;
      this.speed = 0.2 + Math.random() * 0.4;
    }
  }
}
