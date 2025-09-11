/**
 * Drawable "Keep Going" sign sprite positioned on the ground line at a given x-position.
 * Loads its image, applies fixed dimensions, and places its base at y=425.
 * @extends DrawableObjects
 */
class KeepGoingSign extends DrawableObjects {
  /**
   * Creates a KeepGoingSign at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the sign should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/keep-going-sign.png");
    this.width = 140;
    this.height = 140;
    this.x = x;
    this.y = 425 - this.height;
  }
}
