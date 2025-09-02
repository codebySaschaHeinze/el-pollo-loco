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
      if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
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

      if (typeof Endboss !== "undefined" && enemy instanceof Endboss) return;

      if (this.boxesCollide(this.character, enemy)) {
        const isChicken =
          (typeof Chicken !== "undefined" && enemy instanceof Chicken) || (typeof Chick !== "undefined" && enemy instanceof Chick);

        const charBox = this.getBox(this.character);
        const enemyBox = this.getBox(enemy);

        const isFalling = typeof this.character.fallingDown === "function" ? this.character.fallingDown() : this.character.speedY < 0;

        const charBottom = charBox.y + charBox.h;
        const overlapY = charBottom - enemyBox.y;
        const fromAbove = isChicken && isFalling && overlapY >= 0 && overlapY <= 40;

        if (fromAbove) {
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
      if (this.boxesCollide(this.character, boss)) {
        if (this.character.hit && this.character.hit(20)) {
          this.statusBar.setPercentage(this.character.energy);
        }
        const push = this.character.x < boss.x ? -40 : 40;
        this.character.x += push;
        this.character.speedY = 12;
      }

      this.throwableObjects.forEach((bottle) => {
        if (bottle.gone || bottle.didDamage) return;

        // Statt "irgendwie kollidiert" -> erst zerschlagen, wenn die Überlappung tief genug ist
        const { ox, oy } = this.overlapXY(bottle, boss);
        const DEEP_X = 26; // ~20-30px, nach Geschmack anpassen
        const MIN_Y = 8; // bisschen vertikal überlappen

        if (ox >= DEEP_X && oy >= MIN_Y) {
          bottle.didDamage = true; // nur 1x Schaden pro Flasche
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

  getBox(o) {
    const off = o?.offset || { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      x: o.x + off.left,
      y: o.y + off.top,
      w: Math.max(0, o.width - off.left - off.right),
      h: Math.max(0, o.height - off.top - off.bottom),
    };
  }

  boxesCollide(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
  }

  overlapXY(a, b) {
    const A = this.getBox(a),
      B = this.getBox(b);
    const ox = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x));
    const oy = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y));
    return { ox, oy };
  }
}
