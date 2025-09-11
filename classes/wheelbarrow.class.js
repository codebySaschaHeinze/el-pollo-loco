/**
 * Drawable wheelbarrow sprite positioned at a given x on the ground line.
 * Loads its image, sets fixed dimensions, and places its base at y=433.
 * @extends DrawableObjects
 */
class Wheelbarrow extends DrawableObjects {
  /**
   * Creates a wheelbarrow at the specified horizontal position.
   * @param {number} x - The world x-coordinate (left edge) where the wheelbarrow should be placed.
   */
  constructor(x) {
    super().loadImage("assets/imgs/extras/wheelbarrow.png");
    this.width = 73;
    this.height = 73;
    this.x = x;
    this.y = 433 - this.height;
  }
}
