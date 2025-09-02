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
    this.level.bottlePickups?.forEach((b) => (b.world = this));

    const boss = this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss));
    if (boss) {
      boss.world = this;
      boss.startSpawning();
      this.level.endboss = boss;
      if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
      this.updateBottleBar();
    }
  }

  run() {
    setInterval(() => {
      this.checkThrowObjects();
    }, 200);
  }

  checkThrowObjects() {
    if (this.keyboard.SPACE && this.character.canThrowBottle && this.character.canThrowBottle()) {
      const bottle = new ThrowableObjects(this.character.x + 50, this.character.y + 50);
      bottle.world = this;
      this.throwableObjects.push(bottle);

      if (this.character.useBottle && this.character.useBottle()) {
        this.updateBottleBar();
      }
    }
  }

  checkCollisions() {
    if (this.level.bottlePickups && this.level.bottlePickups.length) {
      this.level.bottlePickups.forEach((p) => {
        if (p.collected) return;
        if (this.boxesCollide(this.character, p)) {
          if (this.character.bottles < this.character.maxBottles) {
            this.character.addBottle(1);
            this.updateBottleBar();
            p.collected = true;
          }
        }
      });
      this.level.bottlePickups = this.level.bottlePickups.filter((p) => !p.collected);
    }

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

        const { ox, oy } = this.overlapXY(bottle, boss);
        const DEEP_X = 26;
        const MIN_Y = 8;

        if (ox >= DEEP_X && oy >= MIN_Y) {
          bottle.didDamage = true;
          boss.takeHit && boss.takeHit(10);
          if (typeof bottle.break === "function") bottle.break();
          else bottle.gone = true;
        }
      });
    }

    this.throwableObjects.forEach((bottle) => {
      if (bottle.gone || bottle.breaking || bottle.didDamage) return;

      for (let i = 0; i < this.level.enemies.length; i++) {
        const e = this.level.enemies[i];
        if (e.dead) continue;

        if (typeof Endboss !== "undefined" && e instanceof Endboss) continue;

        const { ox, oy } = this.overlapXY(bottle, e);
        const HIT_X = 18;
        const HIT_Y = 8;

        if (ox >= HIT_X && oy >= HIT_Y) {
          if (typeof e.die === "function") e.die();

          bottle.didDamage = true;
          if (typeof bottle.break === "function") bottle.break();
          else bottle.gone = true;

          break;
        }
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.level.clouds.forEach((c) => c.update && c.update());
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.bottlePickups);
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

  toBottlePercent() {
    const b = this.character?.bottles || 0;
    if (b <= 0) return 0;
    const raw = Math.min(100, b * 10);
    return Math.ceil(raw / 20) * 20;
  }
  updateBottleBar() {
    this.bottleBar.setPercentage(this.toBottlePercent());
  }
}
