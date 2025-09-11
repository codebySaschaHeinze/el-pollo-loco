/**
 * Drawable guitar sprite placed on the ground line at a given x-position.
 * Loads its image, sets fixed dimensions, and positions its base at y=420.
 * @extends DrawableObjects
 */
class Guitar extends DrawableObjects {
  /**
   * Creates a guitar at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the guitar should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/guitar.png");
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = 420 - this.height;
  }
}
