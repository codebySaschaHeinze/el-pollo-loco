class StatusBar extends DrawableObjects {
  STATUS_IMAGES = [
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
  ];

  percentage = 100;

  constructor() {
    super();
    this.loadImages(this.STATUS_IMAGES);
    this.x = 30;
    this.y = 20;
    this.setPercentage(100);
    this.width = 110;
    this.height = 30;
  }

  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.STATUS_IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage > 80) {
      return 4;
    } else if (this.percentage > 60) {
      return 3;
    } else if (this.percentage > 40) {
      return 2;
    } else if (this.percentage > 20) {
      return 1;
    } else {
      return 0;
    }
  }
}
