/**
 * Drawable wagon wheel variant positioned on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and places its base at y=420.
 * @extends DrawableObjects
 */
class Wheel2 extends DrawableObjects {
  /**
   * Creates a wheel at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the wheel should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheel2.png");
    this.width = 67;
    this.height = 67;
    this.x = x;
    this.y = 420 - this.height;
  }
}
