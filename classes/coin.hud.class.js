class CoinHUD extends DrawableObjects {
  constructor() {
    super();
    this.x = 15;
    this.y = 90;
    this.width = 65;
    this.height = 65;
    this.count = 0;

    this.loadImage("assets/imgs/8_coin/coin_2.png");
  }

  setCount(count) {
    this.count = Math.max(0, count | 0);
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    ctx.save();
    ctx.font = "24px ubuntu";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,0,0,.6)";
    ctx.fillStyle = "#fff";
    const text = String(this.count);
    const tx = this.x + this.width + 8;
    const ty = this.y + this.height - 25;
    ctx.strokeText(text, tx, ty);
    ctx.fillText(text, tx, ty);
    ctx.restore();
  }
}
