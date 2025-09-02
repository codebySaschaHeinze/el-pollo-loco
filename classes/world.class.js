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

    const boss = this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss));
    if (boss) {
      boss.world = this;
      boss.startSpawning();
      this.level.endboss = boss;
    }
  }

  run() {
    setInterval(() => {
      this.checkThrowObjects();
    }, 200);
  }

  checkThrowObjects() {
    if (this.keyboard.SPACE) {
      let bottle = new ThrowableObjects(this.character.x + 50, this.character.y + 50);
      this.throwableObjects.push(bottle);
    }
  }

  checkCollisions() {
    if (this.character.isDead && this.character.isDead()) return;
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

    const boss = this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss));

    if (boss && !boss.dead) {
      if (this.character.isColliding(boss)) {
        if (this.character.hit && this.character.hit(20)) {
          this.statusBar.setPercentage(this.character.energy);
        }
        const push = this.character.x < boss.x ? -40 : 40;
        this.character.x += push;
        this.character.speedY = 12;
      }

      this.throwableObjects.forEach((bottle) => {
        if (bottle.gone) return;
        const collides = typeof bottle.isColliding === "function" ? bottle.isColliding(boss) : this.rectsCollide(bottle, boss); // Fallback, siehe unten

        if (collides) {
          boss.takeHit && boss.takeHit(10);
          if (typeof bottle.break === "function") bottle.break();
          else bottle.gone = true;
        }
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.level.clouds.forEach((c) => c.update && c.update());
    this.addObjectsToMap(this.level.clouds);
    this.addToMap(this.character);
    this.level.enemies.forEach((e) => e.update && e.update());
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.throwableObjects = this.throwableObjects.filter((b) => !b.gone);
    this.checkCollisions();
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.moneyBar);
    this.addToMap(this.bottleBar);

    requestAnimationFrame(() => this.draw());
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
