class Chicken extends MovableObjects {
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];
  currentImage = 0;
  width = 48;
  height = 62;
  dead = false;
  constructor(xStart = 0, speed = null) {
    super().loadImage("assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);

    this.x = xStart; // <-- statt random im Konstruktor
    this.y = 365 + Math.random() * 10; // leichte Boden-Streuung
    this.speed = speed ?? 0.8 + Math.random() * 0.7; // 0.8–1.5 px/Frame

    this.animate();
  }

  draw(ctx) {
    if (!this.dead) {
      super.draw(ctx);
      return;
    }

    const elapsed = Date.now() - (this.deadAt || 0);
    const t = Math.min(elapsed / (this.fadeDuration || 2000), 1); // 0..1
    const alpha = 1 - t;

    ctx.save();
    ctx.globalAlpha = alpha;
    super.draw(ctx);
    ctx.restore();

    // Nach kompletter Fade-Zeit als "verschwunden" markieren
    if (t >= 1) this.gone = true;
  }

  die() {
    this.dead = true;
    this.speed = 0;
    this.deadAt = Date.now();
    this.fadeDuration = 1000;
    if (this.walkInterval) clearInterval(this.walkInterval);
    this.loadImage("assets/imgs/3_enemies_chicken/chicken_normal/2_dead/dead.png");
  }

  animate() {
    this.walkInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }

  update() {
    if (this.dead) return;
    this.otherDirection = false;
    this.x -= this.speed;
    if (this.x < -this.width) {
      const worldEnd = this.world?.level?.level_end_x || 8000;
      this.x = worldEnd + 100 + Math.random() * 300;
      this.speed = 0.8 + Math.random() * 0.7;
      this.y = 365 + Math.random() * 10;
    }
  }
}

window.Chicken = Chicken;
