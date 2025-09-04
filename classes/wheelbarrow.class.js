class Wheelbarrow extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheelbarrow.png");
    this.width = 73;
    this.height = 73;
    this.x = x;
    this.y = 433 - this.height;
  }
}
