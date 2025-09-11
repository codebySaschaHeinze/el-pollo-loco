/**
 * Background layer sprite anchored to the ground line.
 * Loads a single image, uses fixed dimensions, and positions itself so its base rests on y=480.
 * @extends MovableObjects
 */
class BackgroundObjects extends MovableObjects {
  /** @type {number} */ width = 1440;
  /** @type {number} */ height = 480;

  /**
   * Creates a background object.
   * @param {string} imagePath - Path to the background image.
   * @param {number} x - World x-coordinate (left edge) where the image starts.
   */
  constructor(imagePath, x) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = 480 - this.height;
  }
}
