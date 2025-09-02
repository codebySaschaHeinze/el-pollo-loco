class ThrowableObjects extends MovableObjects {
  angle = 0;
  moveInterval = null;
  breaking = false;
  brokenAt = 0;
  breakDuration = 400;
  didDamage = false;

  IMAGES_BREAK = [
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "assets/imgs/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  constructor(x, y) {
    super().loadImage("assets/imgs/6_salsa_bottle/salsa_bottle.png");
    this.loadImages(this.IMAGES_BREAK);
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 40;
    this.throw();
  }

  throw() {
    this.speedY = 30;
    this.applGravity();
    this.moveInterval = setInterval(() => {
      this.x += 30;
    }, 50);
  }

  break() {
    if (this.breaking) return;
    this.breaking = true;
    this.brokenAt = Date.now();
    this.speedY = 0;
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
  }

  draw(ctx) {
    if (this.breaking) {
      const t = Math.min((Date.now() - this.brokenAt) / this.breakDuration, 1);
      const idx = Math.min(Math.floor(t * this.IMAGES_BREAK.length), this.IMAGES_BREAK.length - 1);
      const frame = this.IMAGES_BREAK[idx];
      const img = this.imageCache[frame];

      if (img) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.restore();
      }
      if (t >= 1) this.gone = true;
      return;
    }
    ctx.save();

    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.angle);
    ctx.translate(-this.width / 2, -this.height / 2);

    ctx.drawImage(this.img, 0, 0, this.width, this.height);
    ctx.restore();

    this.angle += 0.25;
  }
}
