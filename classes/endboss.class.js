class Endboss extends MovableObjects {
  width = 250;
  height = 400;
  x = 700;
  y = 50;
  energy = 100;
  dead = false;
  spawnInterval = null;
  currentImage = 0;

  patrolMinX = 7000;
  patrolMaxX = 7600;
  speed = 1.5;

  attackEveryMs = 3000;
  attackSpeed = 3.2;
  attackDuration = 600;
  attackCooldown = 1000;
  lastAttackAt = 0;
  attacking = false;
  attackUntil = 0;

  state = "walk";
  animInterval = null;

  hurtMs = 250;
  hurtUntil = 0;

  dying = false;
  deathIndex = 0;
  deathDone = false;
  deathFrameMs = 120;
  fadeOutMs = 1000;
  fadeStartAt = 0;
  vanished = false;

  IMAGES_WALKING = [
    "assets/imgs/4_enemie_boss_chicken/1_walk/g1.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g2.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g3.png",
    "assets/imgs/4_enemie_boss_chicken/1_walk/g4.png",
  ];

  IMAGES_ATTACK = [
    "assets/imgs/4_enemie_boss_chicken/3_attack/g13.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g13.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g15.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g16.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g17.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g18.png",
    "assets/imgs/4_enemie_boss_chicken/3_attack/g19.png",
  ];
  IMAGES_HURT = [
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g21.png",
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g22.png",
    "assets/imgs/4_enemie_boss_chicken/4_hurt/g23.png",
  ];

  IMAGES_DEAD = [
    "assets/imgs/4_enemie_boss_chicken/5_dead/g24.png",
    "assets/imgs/4_enemie_boss_chicken/5_dead/g25.png",
    "assets/imgs/4_enemie_boss_chicken/5_dead/g26.png",
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.animate();
    this.lastAttackAt = Date.now();
    this.offset = { top: 20, right: 40, bottom: 20, left: 40 };
    this.otherDirection = true;
  }

  draw(ctx) {
    if (this.vanished) return;

    if (this.dying && this.deathDone) {
      const elapsed = Date.now() - (this.fadeStartAt || Date.now());
      const t = Math.min(elapsed / this.fadeOutMs, 1);
      const alpha = 1 - t;

      const rise = Math.floor(this.height * 0.4 * t);

      ctx.save();
      ctx.globalAlpha = alpha;

      const oldY = this.y;
      this.y = oldY - rise;
      super.draw(ctx);
      this.y = oldY;

      ctx.restore();

      if (t >= 1) this.vanished = true;
      return;
    }

    super.draw(ctx);
  }

  animate() {
    this.animInterval = setInterval(() => {
      if (this.dying) {
        const last = this.IMAGES_DEAD.length - 1;
        const idx = Math.min(this.deathIndex, last);
        const frame = this.IMAGES_DEAD[idx];
        if (frame) this.loadImage(frame);

        if (this.deathIndex < last) {
          this.deathIndex++;
        } else {
          this.deathDone = true;
          if (!this.fadeStartAt) this.fadeStartAt = Date.now();
        }
        return;
      }

      if (this.dead) return;

      let frames = this.IMAGES_WALKING;
      if (Date.now() < this.hurtUntil) {
        frames = this.IMAGES_HURT;
      } else if (this.state === "attack") {
        frames = this.IMAGES_ATTACK;
      }
      this.playAnimation(frames);
    }, this.deathFrameMs);
  }

  update() {
    if (this.vanished || this.dying || this.dead) return;
    this.otherDirection = false;
    if (!this._initd) {
      this._initd = true;
      if (this.x < this.patrolMinX) this.x = this.patrolMinX;
      if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
      this._dir = -1;
    }

    const now = Date.now();
    const c = this.world?.character;
    let moved = 0; // ← hier merken wir die X-Bewegung dieses Frames

    // ATTACK
    if (this.attacking && now < this.attackUntil) {
      let dir = this._dir ?? -1;
      if (c) {
        const myMid = this.x + this.width / 2;
        const hisMid = c.x + c.width / 2;
        dir = hisMid < myMid ? -1 : 1;
      }
      const step = dir * this.attackSpeed;
      this.x += step;
      moved = step;

      this.clampToPatrol();
      this.state = "attack";

      return;
    }

    if (this.attacking && now >= this.attackUntil) {
      this.attacking = false;
    }

    if (!this.attacking && now - this.lastAttackAt >= this.attackEveryMs) {
      this.startAttack();
      return;
    }

    this.state = "walk";
    const step = (this._dir ?? -1) * this.speed;
    this.x += step;
    moved = step;

    if (this.x <= this.patrolMinX) {
      this.x = this.patrolMinX;
      this._dir = 1;
    }
    if (this.x + this.width >= this.patrolMaxX) {
      this.x = this.patrolMaxX - this.width;
      this._dir = -1;
    }
  }

  startAttack() {
    this.attacking = true;
    this.lastAttackAt = Date.now();
    this.attackUntil = this.lastAttackAt + this.attackDuration;
    this.state = "attack";
  }

  clampToPatrol() {
    if (this.x < this.patrolMinX) this.x = this.patrolMinX + -100;
    if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
  }

  takeHit(damage = 10) {
    if (this.dead || this.dying) return;
    this.energy = Math.max(0, this.energy - damage);
    if (this.energy <= 0) {
      this.die();
    } else {
      this.hurtUntil = Date.now() + this.hurtMs;
    }
  }

  die() {
    if (this.dead || this.dying) return;

    this.dead = true;
    this.dying = true;
    this.state = "die";

    this.deathIndex = 0;
    this.deathDone = false;
    this.fadeStartAt = 0;

    this.lastAttackAt = Infinity;
    this.attacking = false;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
  }

  startSpawning() {
    if (this.spawnInterval || this.dead) return;

    const ensure = () => {
      if (typeof Chick === "undefined") {
        setTimeout(ensure, 200);
        return;
      }

      this.spawnInterval = setInterval(() => this.spawnChick(), 6000);
    };

    ensure();
  }

  spawnChick() {
    if (!this.world || this.dead) return;

    const ground = this.world?.character?.groundBottom || 417;

    const midX = this.x + this.width / 2;
    const rawY = this.y + this.height - 30;
    const spawnY = Math.min(rawY, ground - 90);

    const chick = new Chick(0, 0.6 + Math.random() * 0.6);
    chick.world = this.world;

    chick.x = Math.floor(midX - chick.width / 2);
    chick.startFall(spawnY);

    chick.otherDirection = true;

    this.world.level.enemies.push(chick);
  }
}
