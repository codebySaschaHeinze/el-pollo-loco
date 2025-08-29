class ThrowableObjects extends MovableObjects {
  constructor(x, y) {
    super().loadImage("assets/imgs/6_salsa_bottle/salsa_bottle.png");
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 40;
    this.throw();
  }

  throw() {
    this.speedY = 30;
    this.applGravity();
    setInterval(() => {
      this.x += 10;
    }, 50);
  }
}
