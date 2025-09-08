class Wheel1 extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel1.png");
    this.width = 70;
    this.height = 70;
    this.x = x;
    this.y = 426 - this.height;
  }
}
