class World {
  character;
  level = level1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  moneyBar = new MoneyBar();
  bottleBar = new BottleBar();
  throwableObjects = [];

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.character = new Character(this.keyboard);
    this.setWorld();
    this.draw();
    this.run();
  }

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((e) => (e.world = this));
  }

  run() {
    setInterval(() => {
      this.checkThrowObjects();
    }, 200);
  }

  checkThrowObjects() {
    if (this.keyboard.SPACE) {
      let bottle = new ThrowableObjects(this.character.x + 100, this.character.y + 100);
      this.throwableObjects.push(bottle);
    }
  }

  checkCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (enemy.dead) return;

      if (this.character.isColliding(enemy)) {
        const isChicken = typeof Chicken !== "undefined" && enemy instanceof Chicken;

        const isFalling = typeof this.character.fallingDown === "function" ? this.character.fallingDown() : this.character.speedY < 0; // ggf. auf > 0 drehen, wenn dein Y nach oben negativ ist

        const charBottom = this.character.y + this.character.height;
        const overlapY = charBottom - enemy.y;
        const fromAbove = isFalling && overlapY >= 0 && overlapY <= 40;

        if (isChicken && fromAbove) {
          if (typeof enemy.die === "function") enemy.die();
          if (typeof this.character.bounceOn === "function") {
            this.character.bounceOn(enemy);
          } else {
            this.character.y = enemy.y - this.character.height;
            this.character.speedY = 15;
          }
          return;
        }

        if (typeof this.character.hit === "function") {
          this.character.hit();
          this.statusBar.setPercentage(this.character.energy);
        }
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);

    this.ctx.translate(-this.camera_x, 0);
    // -----Space for fixed objects-----//
    this.addToMap(this.statusBar);
    this.addToMap(this.moneyBar);
    this.addToMap(this.bottleBar);
    this.ctx.translate(this.camera_x, 0);

    this.level.clouds.forEach((c) => c.update());
    this.addObjectsToMap(this.level.clouds);

    this.addToMap(this.character);

    this.level.enemies.forEach((e) => e.update && e.update());
    this.addObjectsToMap(this.level.enemies);
    this.checkCollisions();
    this.addObjectsToMap(this.throwableObjects);

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
      this.flipImage(mo);
    }
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);

    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    this.ctx.restore();
    mo.x = mo.x * -1;
  }
}
