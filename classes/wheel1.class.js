class Wheel1 extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel1.png");
    this.width = 70;
    this.height = 70;
    this.x = x;
    this.y = 427 - this.height;
  }
}
