class Wheel2 extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel2.png");
    this.width = 67;
    this.height = 67;
    this.x = x;
    this.y = 420 - this.height;
  }
}
