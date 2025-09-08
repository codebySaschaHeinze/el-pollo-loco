class LanternBigForeground extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-big-foreground.png");
    this.width = 130;
    this.height = 190;
    this.x = x;
    this.y = 460 - this.height;
  }
}
