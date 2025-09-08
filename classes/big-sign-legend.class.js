class BigSignLegend extends DrawableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/big-sign-legend.png");
    this.width = 300;
    this.height = 430;
    this.x = x;
    this.y = 286 - this.height;
  }
}
