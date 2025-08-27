class Character extends MovableObjects {
  y = 274;
  IMAGES_WALKING = [
    "assets/imgs/2_character_pepe/2_walk/w-21.png",
    "assets/imgs/2_character_pepe/2_walk/w-22.png",
    "assets/imgs/2_character_pepe/2_walk/w-23.png",
    "assets/imgs/2_character_pepe/2_walk/w-24.png",
    "assets/imgs/2_character_pepe/2_walk/w-25.png",
    "assets/imgs/2_character_pepe/2_walk/w-26.png",
  ];
  currentImage = 0;
  world;
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.loadImages(this.IMAGES_WALKING);
    this.keyboard = keyboard;
    this.animate();
  }

  animate() {
    setInterval(() => {
      if (this.keyboard.RIGHT) {
        let i = this.currentImage % this.IMAGES_WALKING.length;
        let path = this.IMAGES_WALKING[i];
        this.img = this.imageCache[path];
        this.currentImage++;
      }
    }, 100);
  }

  jump() {}
}
