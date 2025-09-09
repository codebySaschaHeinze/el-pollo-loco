class BossHealthBar extends DrawableObjects {
  IMAGES = [
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png",
  ];
  percentage = 100;
  boss = null;

  constructor(boss) {
    super();
    this.boss = boss;
    this.loadImages(this.IMAGES);
    this.width = 180;
    this.height = 45;
    this.otherDirection = false;
    this.setPercentage(100);
  }

  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const idx = this.resolveImageIndex();
    const path = this.IMAGES[idx];
    this.img = this.imageCache[path];
  }

  resolveImageIndex() {
    const p = this.percentage;
    if (p >= 100) return 5;
    if (p >= 80) return 4;
    if (p >= 60) return 3;
    if (p >= 40) return 2;
    if (p >= 20) return 1;
    return 0;
  }

  draw(ctx) {
    if (!this.boss || this.boss.vanished) return;
    this.x = this.boss.x + (this.boss.width - this.width) / 2;
    this.y = this.boss.y - 30;
    super.draw(ctx);
  }
}
