class Endboss extends MovableObjects {
  height = 400;
  width = 250;
  x = 700;
  y = 50;
  energy = 100;
  dead = false;
  spawnInterval = null;
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
    this.animate();
  }

  animate() {
    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 100);
  }

  takeHit(damage = 10) {
    this.energy -= damage;
    if (this.energy <= 0) {
      this.die();
    }
  }
  die() {
    if (this.dead) return;
    this.dead = true;
    if (this.spawnInterval) clearInterval(this.spawnInterval);
  }

  startSpawning() {
    if (this.spawnInterval) return;
    this.spawnInterval = setInterval(() => this.spawnChick(), 2500);
  }

  spawnChick() {
    if (!this.world || this.dead) return;
    const spawnX = this.x + this.width / 2 - 14; // halbwegs mittig, 14px offset für kleines Kücken
    const spawnY = this.y + this.height - 10; // Unterkante vom Boss

    const chick = new Chick(spawnX, 0.7 + Math.random() * 0.6); // etwas langsamer als Huhn
    chick.world = this.world;
    chick.startFall(spawnY);
    this.world.level.enemies.push(chick);
  }
}
