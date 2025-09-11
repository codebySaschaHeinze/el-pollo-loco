/**
 * Drawable wagon wheel sprite positioned on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and places its base at y=426.
 * @extends DrawableObjects
 */
class Wheel1 extends DrawableObjects {
  /**
   * Creates a wheel at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the wheel should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel1.png");
    this.width = 70;
    this.height = 70;
    this.x = x;
    this.y = 426 - this.height;
  }
}
