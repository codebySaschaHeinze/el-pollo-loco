/**
 * Drawable warning sign sprite positioned on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and places its base at y=426.
 * @extends DrawableObjects
 */
class WarningSign extends DrawableObjects {
  /**
   * Creates a warning sign at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the sign should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/warning-sign.png");
    this.width = 170;
    this.height = 170;
    this.x = x;
    this.y = 426 - this.height;
  }
}
