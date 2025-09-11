/**
 * Static saloon building sprite positioned at a given world coordinate.
 * Defaults to resting on the ground line when no y is provided.
 * @extends MovableObjects
 */
class Saloon extends MovableObjects {
  /** @type {number} */ width = 500;
  /** @type {number} */ height = 500;

  /**
   * Creates a saloon object.
   * @param {string} imagePath - Path to the saloon image asset.
   * @param {number} x - World x-coordinate (left edge).
   * @param {number|null} [y=null] - Optional y-coordinate; if null, uses 470 - height.
   */
  constructor(imagePath, x, y = null) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = y == null ? 470 - this.height : y;
  }
}
