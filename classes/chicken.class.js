class Chicken extends MovableObjects {
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];
  currentImage = 0;
  width = 38;
  height = 52;
  constructor() {
    super().loadImage("assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);
    this.x = 200 + Math.random() * 500;
    this.y = 365 + Math.random() * 10;
    this.speed = 0.15 + Math.random() * 0.3;
    this.animate();
  }

  animate() {
    this.moveLeft();
    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }
}
