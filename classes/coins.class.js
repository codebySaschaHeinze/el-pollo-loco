/**
 * Coin pickup sprite that snaps to a ground-relative position on first draw.
 * Uses a vertical offset above the ground line from the character for placement.
 * @extends MovableObjects
 */
class Coins extends MovableObjects {
  /**
   * Creates a coin at a given x; y is determined on first draw from the character's ground line.
   * @param {number} x - Initial world x-coordinate.
   * @param {number} [yOffset=30] - Extra vertical offset above the computed ground placement.
   */
  constructor(x, yOffset = 30) {
    super().loadImage("assets/imgs/8_coin/coin_2.png");
    this.x = x;
    this.width = 90;
    this.height = 90;
    this.placed = false;
    this.yOffset = yOffset;
  }

  /**
   * Positions the coin relative to the character's ground line on first render, then draws it.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom - 70 || 417;
      this.y = ground - this.height - this.yOffset;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
