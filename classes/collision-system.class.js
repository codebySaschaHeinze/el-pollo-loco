/**
 * Handles pickups, character/enemy/boss collisions, projectiles and end checks.
 * Provides AABB helpers and stomp detection.
 */
class CollisionSystem {
  /** */
  constructor(world) {
    this.w = world;
  }

  /** Runs all collision passes. */
  step() {
    this.collectCoins();
    this.collectBottles();
    if (this.w.character.isDead?.()) return;
    this.charVsEnemies();
    this.bossCollisions();
    this.bottlesVsEnemies();
  }

  /** Coin pickup + HUD/SFX. */
  collectCoins() {
    const list = this.w.level.coinPickups;
    if (!list?.length) return;
    list.forEach((c) => {
      if (!c.collected && this.boxes(this.w.character, c)) {
        if (this.w.character.addCoin) this.w.character.addCoin(1);
        else this.w.character.coins = (this.w.character.coins || 0) + 1;
        this.w.updateCoinHUD();
        this.w.playSfx("coinPickup", { clone: true });
        c.collected = true;
      }
    });
    this.w.level.coinPickups = list.filter((c) => !c.collected);
  }

  /** Bottle pickup + HUD/SFX. */
  collectBottles() {
    const list = this.w.level.bottlePickups;
    if (!list?.length) return;
    list.forEach((p) => {
      const ok = !p.collected && this.boxes(this.w.character, p) && this.w.character.bottles < this.w.character.maxBottles;
      if (!ok) return;
      this.w.character.addBottle(1);
      this.w.updateBottleBar();
      this.w.playSfx("bottlePickup", { reset: true });
      p.collected = true;
    });
    this.w.level.bottlePickups = list.filter((p) => !p.collected);
  }

  /** Character vs regular enemies (incl. stomp). */
  charVsEnemies() {
    this.w.level.enemies.forEach((e) => this.hitEnemy(e));
  }

  /** One enemy resolution. */
  hitEnemy(e) {
    if (e.dead) return;
    if (typeof Endboss !== "undefined" && e instanceof Endboss) return;
    if (!this.boxes(this.w.character, e)) return;
    if (this.isChicken(e) && this.tryStomp(e)) return;
    const g = this.w.character.isInStompGrace && this.w.character.isInStompGrace();
    if (!g && this.w.character.hit?.()) this.w.statusBar.setPercentage(this.w.character.energy);
  }

  /** Chicken / Chick check. */
  isChicken(e) {
    return (typeof Chicken !== "undefined" && e instanceof Chicken) || (typeof Chick !== "undefined" && e instanceof Chick);
  }

  /** Stomp-from-above; true if handled. */
  tryStomp(enemy) {
    const A = this.box(this.w.character),
      B = this.box(enemy);
    const falling = this.w.character.fallingDown ? this.w.character.fallingDown() : this.w.character.speedY < 0;
    const d = A.y + A.h - B.y,
      ok = falling && d >= 0 && d <= 40;
    if (!ok) return false;
    enemy.die?.();
    this.w.playSfx("chickenHit", { reset: true });
    if (this.w.character.bounceOn) this.w.character.bounceOn(enemy);
    else {
      this.w.character.y = enemy.y - this.w.character.height;
      this.w.character.speedY = 15;
    }
    this.w.character.registerStomp?.();
    return true;
  }

  /** Char & bottles vs boss. */
  bossCollisions() {
    const b = this.w.getBoss();
    if (!b || b.dead) return;
    this.charVsBoss(b);
    this.bottlesVsBoss(b);
  }

  /** Character vs boss. */
  charVsBoss(boss) {
    if (!this.boxes(this.w.character, boss)) return;
    const g = this.w.character.isInStompGrace && this.w.character.isInStompGrace();
    if (!g && this.w.character.hit?.(20)) this.w.statusBar.setPercentage(this.w.character.energy);
    const push = this.w.character.x < boss.x ? -40 : 40;
    this.w.character.x += push;
    this.w.character.speedY = 12;
  }

  /** Bottles vs boss. */
  bottlesVsBoss(boss) {
    this.w.throwableObjects.forEach((b) => {
      if (b.gone || b.didDamage) return;
      const { ox, oy } = this.overlap(b, boss);
      if (ox >= 26 && oy >= 8) {
        b.didDamage = true;
        boss.takeHit?.(10);
        b.break?.() ?? (b.gone = true);
      }
    });
  }

  /** Bottles vs regular enemies. */
  bottlesVsEnemies() {
    this.w.throwableObjects.forEach((b) => {
      if (b.gone || b.breaking || b.didDamage) return;
      for (let i = 0; i < this.w.level.enemies.length; i++) {
        const e = this.w.level.enemies[i];
        if (e.dead) continue;
        if (typeof Endboss !== "undefined" && e instanceof Endboss) continue;
        const { ox, oy } = this.overlap(b, e);
        if (ox >= 18 && oy >= 8) {
          e.die?.();
          b.didDamage = true;
          b.break?.() ?? (b.gone = true);
          break;
        }
      }
    });
  }

  /** Triggers win/lose once. */
  checkEnd() {
    if (this.w.ending) return;
    if (this.w.character?.isDead?.()) {
      this.w.ending = true;
      this.w.scheduleEnd("lose", this.w.endDelayLosesMs);
      return;
    }
    const boss = this.w.level?.endboss;
    if (boss?.dead) {
      this.w.ending = true;
      this.w.scheduleEnd("win", this.w.endDelayWinMs);
    }
  }

  /** AABB helpers. */
  box(o) {
    const t = o?.offset || { top: 0, right: 0, bottom: 0, left: 0 };
    return { x: o.x + t.left, y: o.y + t.top, w: Math.max(0, o.width - t.left - t.right), h: Math.max(0, o.height - t.top - t.bottom) };
  }
  boxes(a, b) {
    const A = this.box(a),
      B = this.box(b);
    return A.x < B.x + B.w && A.x + A.w > B.x && A.y < B.y + B.h && A.y + A.h > B.y;
  }
  overlap(a, b) {
    const A = this.box(a),
      B = this.box(b);
    const ox = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x));
    const oy = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y));
    return { ox, oy };
  }
}
