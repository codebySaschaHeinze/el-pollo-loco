class MovableObjects {
  x = 30;
  img;
  height = 150;
  width = 80;
  imageCache = {};

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = path;
    });
  }

  moveRight() {
    console.log("moving right");
  }

  moveLeft() {}
}
