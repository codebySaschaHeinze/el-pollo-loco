/**
 * Drawable skull sprite placed on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and positions its base at y=425.
 * @extends DrawableObjects
 */
class Skull extends DrawableObjects {
  /**
   * Creates a skull at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the skull should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/skull.png");
    this.width = 50;
    this.height = 50;
    this.x = x;
    this.y = 425 - this.height;
  }
}
