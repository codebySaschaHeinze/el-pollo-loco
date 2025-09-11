/**
 * HUD bar indicating the player's available bottles as discrete steps.
 * Preloads bottle sprites and updates the displayed image based on a percentage value.
 * @extends DrawableObjects
 */
class BottleBar extends DrawableObjects {
  /**
   * Bottle HUD sprite frames ordered from empty to full.
   * @type {string[]}
   */
  BOTTLE_IMAGES = [
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/a.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/b.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/c.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/d.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/e.png",
    "assets/imgs/7_statusbars/1_statusbar/3_statusbar_bottle/orange/f.png",
  ];

  /** Current percentage (0..100) mapped to one of the HUD frames. @type {number} */
  percentage = 100;

  /**
   * Creates the bottle HUD at a fixed screen position and preloads its images.
   */
  constructor() {
    super();
    this.loadImages(this.BOTTLE_IMAGES);
    this.x = 30;
    this.y = 60;
    this.setPercentage(100);
    this.width = 155;
    this.height = 40;
  }

  /**
   * Sets the current percentage and updates the displayed sprite.
   * @param {number} percentage - New percentage value (expected 0..100).
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.BOTTLE_IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Resolves the sprite index based on the current percentage.
   * @returns {number} Index into BOTTLE_IMAGES (0..5).
   */
  resolveImageIndex() {
    if (this.percentage >= 100) {
      return 5;
    } else if (this.percentage >= 80) {
      return 4;
    } else if (this.percentage >= 60) {
      return 3;
    } else if (this.percentage >= 40) {
      return 2;
    } else if (this.percentage >= 20) {
      return 1;
    } else {
      return 0;
    }
  }
}
