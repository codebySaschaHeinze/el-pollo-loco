class LanternBig extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-big.png");
    this.width = 80;
    this.height = 140;
    this.x = x;
    this.y = 418 - this.height;
  }
}
