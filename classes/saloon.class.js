class Saloon extends MovableObjects {
  width = 480;
  height = 480;
  placed = false;

  constructor(imagePath, x) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = 420;
  }

  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom || 417;
      this.y = ground - this.height;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
