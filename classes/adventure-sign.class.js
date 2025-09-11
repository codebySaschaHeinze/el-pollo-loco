/**
 * Drawable adventure sign sprite placed on the ground at a given x-position.
 * Loads its image, sets fixed dimensions, and positions itself so the base sits on the ground line.
 * @extends DrawableObjects
 */
class AdventureSign extends DrawableObjects {
  /**
   * Creates an AdventureSign at the specified horizontal world position.
   * @param {number} x - The world x-coordinate (left edge) where the sign should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/adventure-sign.png");
    this.width = 140;
    this.height = 140;
    this.x = x;
    this.y = 425 - this.height;
  }
}
