class Chicken extends MovableObjects {
  IMAGES_WALKING = [
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "assets/imgs/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];
  currentImage = 0;
  width = 38;
  height = 52;
  constructor(xStart = 0, speed = null) {
    super().loadImage("assets/imgs/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
    this.loadImages(this.IMAGES_WALKING);

    this.x = xStart; // <-- statt random im Konstruktor
    this.y = 365 + Math.random() * 10; // leichte Boden-Streuung
    this.speed = speed ?? 0.8 + Math.random() * 0.7; // 0.8–1.5 px/Frame

    this.animate();
  }

  animate() {
    // Bewegung NICHT hier, sonst doppelter Takt
    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }
  update() {
    this.x -= this.speed;
    if (this.x < -this.width) {
      const worldEnd = this.world?.level?.level_end_x || 8000; // Fallback
      this.x = worldEnd + 100 + Math.random() * 300; // rechts rein
      this.speed = 0.8 + Math.random() * 0.7; // neue Speed
      this.y = 365 + Math.random() * 10; // kleine Varianz
    }
  }
}
