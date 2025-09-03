class Coins extends MovableObjects {
  constructor(x, yOffset = 30) {
    super().loadImage("assets/imgs/8_coin/coin_2.png");
    this.x = x;
    this.width = 90;
    this.height = 90;
    this.placed = false;
    this.yOffset = yOffset;
  }

  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom || 417;
      this.y = ground - this.height - this.yOffset;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
