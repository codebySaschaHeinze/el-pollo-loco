/**
 * HUD element that displays a coin icon with the current coin count.
 * Draws a stylized number next to the icon.
 * @extends DrawableObjects
 */
class CoinHUD extends DrawableObjects {
  /**
   * Initializes the HUD position/size and loads the coin image.
   */
  constructor() {
    super();
    this.x = 15;
    this.y = 90;
    this.width = 65;
    this.height = 65;
    /** Current coin count shown in the HUD. @type {number} */
    this.count = 0;

    this.loadImage("assets/imgs/8_coin/coin_2.png");
  }

  /**
   * Sets the coin counter (clamped to a non-negative integer).
   * @param {number} count - New coin count.
   * @returns {void}
   */
  setCount(count) {
    this.count = Math.max(0, count | 0);
  }

  /**
   * Renders the coin icon and the numeric count text.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.save();
    ctx.font = "24px ubuntu";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,.6)";
    ctx.fillStyle = "#f2d21eff";
    const text = String(this.count);
    const tx = this.x + this.width + 8;
    const ty = this.y + this.height - 25;
    ctx.strokeText(text, tx, ty);
    ctx.fillText(text, tx, ty);
    ctx.restore();
  }
}
