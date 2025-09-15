/**
 * Base class for drawable entities with position, size, and an image cache.
 * Provides helpers to load single/multiple images and render to a canvas.
 */
class DrawableObjects {
  x = 0;
  y = 0;
  img = null;
  width = 80;
  height = 150;
  imageCache = {};
  currentImage = 0;

  /**
   * Loads a single image and sets it as the current sprite, also caching it by path.
   * @param {string} path - Image source path.
   * @returns {void}
   */
  loadImage(path) {
    const img = new Image();
    img.src = path;
    this.img = img;
    this.imageCache[path] = img;
  }

  /**
   * Preloads multiple images into the cache without changing the current sprite.
   * Safely no-ops if the input is not iterable via forEach.
   * @param {string[]} arr - Array of image paths to preload.
   * @returns {void}
   */
  loadImages(arr) {
    if (!arr || typeof arr.forEach !== "function") return;
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * Draws the current image to the canvas at (x, y) with (width, height).
   * No-ops if no image is set.
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
   * @returns {void}
   */
  draw(ctx) {
    if (!this.img) return;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
