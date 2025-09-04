class Wheel2 extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel2.png");
    this.width = 67;
    this.height = 67;
    this.x = x;
    this.y = 424 - this.height;
  }
}
