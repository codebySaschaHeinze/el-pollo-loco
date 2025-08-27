class World {
  character;
  enemies = [new Chicken(), new Chicken(), new Chicken()];

  clouds = [new Cloud()];

  backgroundObjects = [
    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 0),

    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 1440),

    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 2880),
  ];

  canvas;
  ctx;
  keyboard;
  camera_x = 0;

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
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.backgroundObjects);

    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);
    this.ctx.translate(-this.camera_x, 0);
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
    if (mo.otherDirection) {
      this.ctx.save();
      this.ctx.translate(mo.width, 0);
      this.ctx.scale(-1, 1);
      mo.x = mo.x * -1;
    }
    this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    if (mo.otherDirection) {
      this.ctx.restore();
      mo.x = mo.x * -1;
    }
  }
}
