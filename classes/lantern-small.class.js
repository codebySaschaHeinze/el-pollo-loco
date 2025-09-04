class LanternSmall extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-small.png");
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = 372 - this.height;
  }
}
