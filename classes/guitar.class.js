class Guitar extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/guitar.png");
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = 420 - this.height;
  }
}
