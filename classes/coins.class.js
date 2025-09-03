class Coins extends MovableObjects {
  constructor(x, y) {
    super().loadImage("assets/imgs/8_coin/coin_2.png");
    this.x = x;
    this.y = y;
    this.width = 65;
    this.height = 65;
    this.offset = { top: 6, right: 6, bottom: 6, left: 6 };
    this.placed = false;
  }
  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom - 130 || 417;
      this.y = ground - this.height;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
