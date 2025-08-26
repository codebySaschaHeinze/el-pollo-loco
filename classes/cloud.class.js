class Cloud extends MovableObjects {
  constructor() {
    super().loadImage("assets/imgs/5_background/layers/4_clouds/1.png");
    this.x = 200 + Math.random() * 500;
  }
}
