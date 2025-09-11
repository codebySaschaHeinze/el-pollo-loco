/**
 * Ground bottle pickup that snaps to the character's ground line on first draw.
 * Sets collision offset and fixed dimensions for consistent hit detection.
 * @extends MovableObjects
 */
class Bottles extends MovableObjects {
  /**
   * Creates a bottle pickup at an initial position.
   * @param {number} x - Initial world x-coordinate.
   * @param {number} y - Initial world y-coordinate (will be adjusted to ground on first draw).
   */
  constructor(x, y) {
    super().loadImage("assets/imgs/6_salsa_bottle/1_salsa_bottle_on_ground.png");
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 55;
    this.offset = { top: 20, right: 6, bottom: 6, left: 6 };
    this.placed = false;
  }

  /**
   * Positions the bottle on the ground line (derived from the character) once, then draws it.
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom || 417;
      this.y = ground - this.height;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
