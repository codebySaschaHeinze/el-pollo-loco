class KeepGoingSign extends MovableObjects {
  constructor(x) {
    super().loadImage("assets/imgs/extras/keep-going-sign.png");
    this.width = 140;
    this.height = 140;
    this.x = x;
    this.y = 425 - this.height;
  }
}
