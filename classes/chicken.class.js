class Chicken extends MovableObjects {
  width = 38;
  height = 52;
  constructor() {
    super().loadImage("assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.x = 200 + Math.random() * 500;
    this.y = 365 + Math.random() * 10;
  }
}
