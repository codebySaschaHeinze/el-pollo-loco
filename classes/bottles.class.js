class Bottles extends MovableObjects {
  constructor(x, y) {
    super().loadImage("assets/imgs/6_salsa_bottle/1_salsa_bottle_on_ground.png");
    this.x = x;
    this.y = y;
    this.width = 45;
    this.height = 55;
    this.offset = { top: 6, right: 6, bottom: 6, left: 6 };
    this.placed = false;
  }
  draw(ctx) {
    if (!this.placed && this.world && this.world.character) {
      const ground = this.world.character.groundBottom || 417;
      this.y = ground - this.height;
      this.placed = true;
    }
    super.draw(ctx);
  }
}
