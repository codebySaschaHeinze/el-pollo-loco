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
    this.character.x = 100;
    this.setWorld();
    this.draw();
    this.run();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.level.clouds.forEach((c) => c.update && c.update());
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.bottlePickups);
    this.addObjectsToMap(this.level.coinPickups);
    this.level.enemies.forEach((e) => e.update && e.update());
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.foregroundObjects);
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

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((e) => (e.world = this));
    this.level.bottlePickups?.forEach((b) => (b.world = this));
    this.level.coinPickups?.forEach((c) => (c.world = this));
    this.level.foregroundObjects?.forEach((f) => (f.world = this));

    const boss = this.level.endboss || (typeof Endboss !== "undefined" && this.level.enemies.find((e) => e instanceof Endboss));
    if (boss) {
      boss.world = this;
      boss.startSpawning();
      this.level.endboss = boss;
      if (!this.level.enemies.includes(boss)) this.level.enemies.push(boss);
    }
    this.updateBottleBar();
    this.updateMoneyBar();
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
    if (this.level.coinPickups && this.level.coinPickups.length) {
      this.level.coinPickups.forEach((c) => {
        if (c.collected) return;
        if (this.boxesCollide(this.character, c)) {
          if (typeof this.character.addCoin === "function") this.character.addCoin(1);
          else this.character.coins = (this.character.coins || 0) + 1;

          this.updateMoneyBar();
          c.collected = true;
        }
      });
      this.level.coinPickups = this.level.coinPickups.filter((c) => !c.collected);
    }

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
    const b = Math.min(this.character?.bottles || 0, 10);
    const steps = Math.floor(b / 2);
    return steps * 20;
  }

  updateBottleBar() {
    const pct = this.toBottlePercent();
    console.log("Bottles:", this.character?.bottles, "→ Bar:", pct, "%");
    this.bottleBar.setPercentage(pct);
  }

  toCoinPercent() {
    // Standard: 10 Coins = 100%, 0..10 → 0,20,40,60,80,100
    const coins = Math.min(this.character?.coins || 0, 10);
    const steps = Math.floor(coins / 2); // 0..5
    return steps * 20;
  }

  updateMoneyBar() {
    this.moneyBar.setPercentage(this.toCoinPercent());
  }
}
