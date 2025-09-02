class Cloud extends MovableObjects {
  y = 10;
  width = Math.random() * 400 + 150;
  height = Math.random() * 150 + 100;

  IMAGES = [
    "assets/imgs/5_background/layers/4_clouds/1.png",
    "assets/imgs/5_background/layers/4_clouds/2.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/1.png",
    "assets/imgs/5_background/layers/4_clouds/2.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/1.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/1.png",
    "assets/imgs/5_background/layers/4_clouds/2.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
    "assets/imgs/5_background/layers/4_clouds/3.png",
  ];
  constructor(worldWidth, xStart = null) {
    super();
    const rand = (arr) => arr[(Math.random() * arr.length) | 0];
    this.loadImage(rand(this.IMAGES));

    this.worldWidth = worldWidth;
    this.x = xStart ?? worldWidth + Math.random() * 200;
    this.y = 10 + Math.random() * 40;
    this.speed = 0.1 + Math.random() * 0.4;

    this.animate();
  }

  animate() {}

  update() {
    this.x -= this.speed;
    if (this.x < -this.width) {
      this.x = this.worldWidth + 50 + Math.random() * 200;
      this.y = 10 + Math.random() * 40;
      this.speed = 0.2 + Math.random() * 0.4;
    }
  }
}
