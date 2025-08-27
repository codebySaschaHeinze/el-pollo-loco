class Endboss extends MovableObjects {
  IMAGES_WALKING = [
    "assets/imgs/4_enemie_boss_chicken/2_alert/g5.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g6.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g7.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g8.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g9.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g10.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g11.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g12.png",
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.x = 700;
  }

  animate() {
    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }
}
