class Cloud extends MovableObjects {
  y = 10;
  width = Math.random() * 300 + 100;
  height = Math.random() * 80 + 50;

  IMAGES = [
    "assets/imgs/5_background/layers/4_clouds/cloud01.png",
    "assets/imgs/5_background/layers/4_clouds/cloud02.png",
    "assets/imgs/5_background/layers/4_clouds/cloud03.png",
    "assets/imgs/5_background/layers/4_clouds/cloud04.png",
    "assets/imgs/5_background/layers/4_clouds/cloud05.png",
    "assets/imgs/5_background/layers/4_clouds/cloud07.png",
    "assets/imgs/5_background/layers/4_clouds/cloud08.png",
    "assets/imgs/5_background/layers/4_clouds/cloud09.png",
    "assets/imgs/5_background/layers/4_clouds/cloud11.png",
    "assets/imgs/5_background/layers/4_clouds/cloud01.png",
  ];
  constructor(worldWidth, xStart = null) {
    super();
    const rand = (arr) => arr[(Math.random() * arr.length) | 0];
    this.loadImage(rand(this.IMAGES));

    this.worldWidth = worldWidth;
    this.x = xStart ?? worldWidth + Math.random() * 200;
    this.y = 10 + Math.random() * 50;
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
