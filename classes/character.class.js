class Character extends MovableObjects {
  // y = 274;
  y = 180;
  speed = 6;
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
  currentImage = 0;
  world;
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.applGravity();
    this.keyboard = keyboard;
    this.animate();
  }

  animate() {
    setInterval(() => {
      if (this.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        // this.walking_sound.play();
      }

      if (this.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
        // this.walking_sound.play();
      }

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.jump();
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    setInterval(() => {
      if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 100);
  }
}
