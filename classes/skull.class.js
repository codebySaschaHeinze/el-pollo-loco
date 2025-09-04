class Skull extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/skull.png");
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = 425 - this.height;
  }
}
