class Wheelbarrow extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheelbarrow.png");
    this.width = 70;
    this.height = 70;
    this.x = x;
    this.y = 433 - this.height;
  }
}
