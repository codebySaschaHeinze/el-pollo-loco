class Chick extends Chicken {
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  constructor(xStart = 0, speed = null) {
    super(xStart, speed);
    this.width = 28;
    this.height = 38;
    this.loadImages(this.IMAGES_WALKING);
    this.falling = false;
  }

  startFall(startY) {
    this.y = startY;
    this.speed = 0;
    this.speedY = -5;
    this.applGravity();
    this.falling = true;
  }

  update() {
    if (this.dead) return;

    if (this.falling) {
      const ground = this.world?.character?.groundBottom || 417;
      if (this.y + this.height >= ground) {
        this.y = ground - this.height;
        this.speed = 0.6 + Math.random() * 0.6;
        this.falling = false;
      }
      return;
    }
    super.update();
  }
}
