class Saloon extends MovableObjects {
  width = 500;
  height = 500;

  constructor(imagePath, x, y = null) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = y == null ? 470 - this.height : y;
  }
}
