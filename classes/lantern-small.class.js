/**
 * Drawable small lantern sprite placed on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and positions its base at y=372.
 * @extends DrawableObjects
 */
class LanternSmall extends DrawableObjects {
  /**
   * Creates a small lantern at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the lantern should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-small.png");
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = 372 - this.height;
  }
}
