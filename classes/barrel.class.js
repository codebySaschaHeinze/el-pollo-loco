class Barrel extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/barrel.png");
    this.width = 65;
    this.height = 65;
    this.x = x;
    this.y = 420 - this.height;
  }
}
