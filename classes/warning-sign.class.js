class WarningSign extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/warning-sign.png");
    this.width = 170;
    this.height = 170;
    this.x = x;
    this.y = 426 - this.height;
  }
}
