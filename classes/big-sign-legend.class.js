/**
 * Large decorative legend sign sprite positioned so its base sits on y=286.
 * Loads a fixed-size image and places it at a given horizontal coordinate.
 * @extends DrawableObjects
 */
class BigSignLegend extends DrawableObjects {
  /**
   * Creates a large legend sign at the specified x-position.
   * @param {number} x - The world x-coordinate (left edge) where the sign should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/big-sign-legend.png");
    this.width = 300;
    this.height = 430;
    this.x = x;
    this.y = 286 - this.height;
  }
}
