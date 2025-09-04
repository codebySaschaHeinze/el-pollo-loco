class WarningSign extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/warning-sign.png");
    this.width = 140;
    this.height = 140;
    this.x = x;
    this.y = 422 - this.height;
  }
}
