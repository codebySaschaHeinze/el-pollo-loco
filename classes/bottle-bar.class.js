class BottleBar extends DrawableObjects {
  BOTTLE_IMAGES = [
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/a.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/b.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/c.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/d.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/e.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/f.png",
  ];

  percentage = 100;

  constructor() {
    super();
    this.loadImages(this.BOTTLE_IMAGES);
    this.x = 30;
    this.y = 50;
    this.setPercentage(100);
    this.width = 110;
    this.height = 30;
  }

  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.BOTTLE_IMAGES[this.resolveImageIndex()];
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
