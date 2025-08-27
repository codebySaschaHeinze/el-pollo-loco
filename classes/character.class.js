class Character extends MovableObjects {
  y = 274;
  constructor() {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/I-1.png");
    this.loadImages([
      "assets/imgs/2_character_pepe/2_walk/w-21.png",
      "assets/imgs/2_character_pepe/2_walk/w-22.png",
      "assets/imgs/2_character_pepe/2_walk/w-23.png",
      "assets/imgs/2_character_pepe/2_walk/w-24.png",
      "assets/imgs/2_character_pepe/2_walk/w-25.png",
      "assets/imgs/2_character_pepe/2_walk/w-26.png",
    ]);
  }
  jump() {}
}
