/**
 * Drawable large lantern sprite placed on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and positions its base at y=418.
 * @extends DrawableObjects
 */
class LanternBig extends DrawableObjects {
  /**
   * Creates a large lantern at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the lantern should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-big.png");
    this.width = 80;
    this.height = 140;
    this.x = x;
    this.y = 418 - this.height;
  }
}
