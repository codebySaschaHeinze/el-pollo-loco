class DrawableObjects {
  x = 0;
  img = null;
  width = 80;
  height = 150;
  imageCache = {};
  currentImage = 0;

  loadImage(path) {
    const img = new Image();
    img.src = path;
    this.img = img;
    this.imageCache[path] = img;
  }

  loadImages(arr) {
    if (!arr || typeof arr.forEach !== "function") return;
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  draw(ctx) {
    if (!this.img) return;
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  drawFrame(ctx) {
    if (this instanceof Character || this instanceof Chicken || this instanceof Endboss) {
      ctx.beginPath();
      ctx.lineWidth = "3";
      ctx.strokeStyle = "red";
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    }
  }
}
