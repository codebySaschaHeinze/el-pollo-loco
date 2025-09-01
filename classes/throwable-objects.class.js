class ThrowableObjects extends MovableObjects {
  angle = 0;
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
      this.x += 30;
    }, 50);
  }

  draw(ctx) {
    ctx.save();
    // um die Flaschenmitte drehen
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    ctx.translate(-this.width / 2, -this.height / 2);

    // normales Zeichnen
    ctx.drawImage(this.img, 0, 0, this.width, this.height);
    ctx.restore();

    // Winkel pro Frame erhöhen (Feintuning: 0.15–0.35)
    this.angle += 0.25;
  }
}
