class World {
  character;
  enemies = [new Chicken(), new Chicken(), new Chicken()];

  clouds = [new Cloud()];
  backgroundObjects1 = [new BackgroundObjects("assets/imgs/5_background/layers/air.png", 0)];
  backgroundObjects2 = [new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 0)];
  backgroundObjects3 = [new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 0)];
  backgroundObjects4 = [new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 0)];

  canvas;
  ctx;
  keyboard;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.character = new Character(this.keyboard);
    this.setWorld();
    this.draw();
  }

  setWorld() {
    this.character.world = this;
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
