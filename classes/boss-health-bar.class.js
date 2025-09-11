/**
 * Health bar HUD for the Endboss. Renders above the boss and reflects its current health percentage.
 * Preloads a set of images for discrete percentage steps and switches the sprite based on the value.
 * @extends DrawableObjects
 */
class BossHealthBar extends DrawableObjects {
  /**
   * Sprites for health bar states (0%,20%,40%,60%,80%,100%).
   * @type {string[]}
   */
  IMAGES = [
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/40.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/60.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/80.png",
    "assets/imgs/7_statusbars/1_statusbar/2_statusbar_health/orange/100.png",
  ];

  /** Current health percentage (0..100). @type {number} */
  percentage = 100;

  /** Linked boss instance this HUD tracks. @type {Endboss|null} */
  boss = null;

  /**
   * Creates a boss health bar bound to a specific boss entity.
   * @param {Endboss} boss - The boss whose health this bar should display.
   */
  constructor(boss) {
    super();
    this.boss = boss;
    this.loadImages(this.IMAGES);
    this.width = 180;
    this.height = 45;
    this.otherDirection = false;
    this.setPercentage(100);
  }

  /**
   * Sets the displayed health percentage (clamped and rounded) and updates the sprite.
   * @param {number} p - New percentage value.
   * @returns {void}
   */
  setPercentage(p) {
    this.percentage = Math.max(0, Math.min(100, Math.round(p)));
    const idx = this.resolveImageIndex();
    const path = this.IMAGES[idx];
    this.img = this.imageCache[path];
  }

  /**
   * Resolves the sprite index for the current percentage.
   * @returns {number} Index into IMAGES (0..5).
   */
  resolveImageIndex() {
    const p = this.percentage;
    if (p >= 100) return 5;
    if (p >= 80) return 4;
    if (p >= 60) return 3;
    if (p >= 40) return 2;
    if (p >= 20) return 1;
    return 0;
  }

  /**
   * Positions the bar above the boss and draws it if the boss is present and not vanished.
   * @param {CanvasRenderingContext2D} ctx - The canvas 2D context.
   * @returns {void}
   */
  draw(ctx) {
    if (!this.boss || this.boss.vanished) return;
    this.x = this.boss.x + (this.boss.width - this.width) / 2;
    this.y = this.boss.y - 30;
    super.draw(ctx);
  }
}
