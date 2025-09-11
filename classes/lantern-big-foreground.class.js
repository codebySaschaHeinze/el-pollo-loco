/**
 * Drawable large lantern sprite rendered in the foreground at a given x-position.
 * Loads its image, sets fixed dimensions, and positions its base at y=460.
 * @extends DrawableObjects
 */
class LanternBigForeground extends DrawableObjects {
  /**
   * Creates a foreground lantern at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the lantern should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/lantern-big-foreground.png");
    this.width = 130;
    this.height = 190;
    this.x = x;
    this.y = 460 - this.height;
  }
}
