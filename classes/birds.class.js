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

  static spawnFlock(n, worldWidth, yMin = 20, yMax = 100) {
    const arr = [];
    const stride = worldWidth / (n + 1);
    for (let i = 0; i < n; i++) {
      const jitter = (Math.random() - 0.5) * stride * 0.4; // leichte Streuung
      const x = Math.max(-200, Math.min(worldWidth + 200, Math.floor((i + 1) * stride + jitter)));
      const b = new Birds(worldWidth, x);
      b.y = yMin + Math.random() * (yMax - yMin);
      arr.push(b);
    }
    return arr;
  }

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
