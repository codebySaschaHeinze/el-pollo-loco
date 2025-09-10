class Saloon extends MovableObjects {
  width = 500;
  height = 500;

  // y ist optional: wenn weggelassen → an den unteren Rand "kleben"
  constructor(imagePath, x, y = null) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = y == null ? 470 - this.height : y; // Canvas-Höhe = 480
  }
}
