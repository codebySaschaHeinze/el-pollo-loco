class World {
  character = new Character();
  enemies = [new Chicken(), new Chicken(), new Chicken()];

  clouds = [new Cloud()];
  backgroundObjects1 = [new BackgroundObjects("assets/imgs/5_background/layers/air.png", 0)]; // air.png bleibt gleich, sonst anpassen
  backgroundObjects2 = [new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 0)]; // full.png bleibt gleich, sonst anpassen
  backgroundObjects3 = [new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 0)]; // full.png bleibt gleich, sonst anpassen
  backgroundObjects4 = [new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 0)]; // full.png bleibt gleich, sonst anpassen
  ctx;

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.addObjectsToMap(this.backgroundObjects1);
    this.addObjectsToMap(this.backgroundObjects4);
    this.addObjectsToMap(this.backgroundObjects3);
    this.addObjectsToMap(this.backgroundObjects2);

    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);

    let self = this;

    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
  }
}
