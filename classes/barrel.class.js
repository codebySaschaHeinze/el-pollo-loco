/**
 * Drawable barrel sprite placed on the ground line at a given x-position.
 * Loads its image, sets fixed dimensions, and positions its base at y=420.
 * @extends DrawableObjects
 */
class Barrel extends DrawableObjects {
  /**
   * Creates a barrel at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the barrel should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/barrel.png");
    this.width = 65;
    this.height = 65;
    this.x = x;
    this.y = 420 - this.height;
  }
}
