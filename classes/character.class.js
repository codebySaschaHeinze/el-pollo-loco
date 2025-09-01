class Character extends MovableObjects {
  // y = 274;
  y = 180;
  speed = 6;
  energy = 100;
  lastHit = 0;
  invulnMs = 700;
  hurtMs = 350;
  IMAGES_WALKING = [
    "assets/imgs/2_character_pepe/2_walk/w-21.png",
    "assets/imgs/2_character_pepe/2_walk/w-22.png",
    "assets/imgs/2_character_pepe/2_walk/w-23.png",
    "assets/imgs/2_character_pepe/2_walk/w-24.png",
    "assets/imgs/2_character_pepe/2_walk/w-25.png",
    "assets/imgs/2_character_pepe/2_walk/w-26.png",
  ];

  IMAGES_JUMPING = [
    "assets/imgs/2_character_pepe/3_jump/j-31.png",
    "assets/imgs/2_character_pepe/3_jump/j-32.png",
    "assets/imgs/2_character_pepe/3_jump/j-33.png",
    "assets/imgs/2_character_pepe/3_jump/j-34.png",
    "assets/imgs/2_character_pepe/3_jump/j-35.png",
    "assets/imgs/2_character_pepe/3_jump/j-36.png",
    "assets/imgs/2_character_pepe/3_jump/j-37.png",
    "assets/imgs/2_character_pepe/3_jump/j-38.png",
    "assets/imgs/2_character_pepe/3_jump/j-39.png",
  ];

  IMAGES_DEAD = [
    "assets/imgs/2_character_pepe/5_dead/d-51.png",
    "assets/imgs/2_character_pepe/5_dead/d-52.png",
    "assets/imgs/2_character_pepe/5_dead/d-53.png",
    "assets/imgs/2_character_pepe/5_dead/d-54.png",
    "assets/imgs/2_character_pepe/5_dead/d-55.png",
    "assets/imgs/2_character_pepe/5_dead/d-56.png",
    "assets/imgs/2_character_pepe/5_dead/d-57.png",
  ];

  IMAGES_HURT = [
    "assets/imgs/2_character_pepe/4_hurt/h-41.png",
    "assets/imgs/2_character_pepe/4_hurt/h-42.png",
    "assets/imgs/2_character_pepe/4_hurt/h-43.png",
  ];
  currentImage = 0;
  world;
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.applGravity();
    this.keyboard = keyboard;
    this.animate();
  }

  isInvulnerable() {
    return Date.now() - (this.lastHitAt || 0) < this.invulnMs;
  }

  hit(damage = 10) {
    if (this.isInvulnerable() || (this.isDead && this.isDead())) return false; // schon getroffen / tot
    this.lastHitAt = Date.now();
    this.energy = Math.max(0, this.energy - damage);

    return true;
  }

  isHurt() {
    return Date.now() - (this.lastHitAt || 0) < this.hurtMs;
  }

  animate() {
    setInterval(() => {
      if (this.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
      }

      if (this.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
      }

      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.jump();
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    setInterval(() => {
      if (this.isDead()) {
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 100);
  }

  fallingDown() {
    return this.speedY < 0;
  }

  bounceOn(enemy) {
    this.y = enemy.y - this.height;
    this.speedY = 15;
  }
}
