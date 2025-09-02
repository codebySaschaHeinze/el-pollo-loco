class Endboss extends MovableObjects {
  width = 250;
  height = 400;
  x = 700;
  y = 50;
  energy = 200;
  dead = false;
  spawnInterval = null;

  patrolMinX = 3000;
  patrolMaxX = 3600;
  speed = 1.5;

  attackEveryMs = 3000;
  attackSpeed = 2.2;
  attackDuration = 600;
  attackCooldown = 1000;
  lastAttackAt = 0;
  attacking = false;
  attackUntil = 0;

  state = "walk";
  animInterval = null;

  IMAGES_WALKING = [
    "assets/imgs/4_enemie_boss_chicken/2_alert/g5.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g6.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g7.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g8.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g9.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g10.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g11.png",
    "assets/imgs/4_enemie_boss_chicken/2_alert/g12.png",
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
    "assets/imgs/4_enemie_boss_chicken/5_dead/g23.png",
    "assets/imgs/4_enemie_boss_chicken/5_dead/g25.png",
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.animate();
    this.lastAttackAt = Date.now();
  }

  animate() {
    this.animInterval = setInterval(() => {
      if (this.dead) return;
      const frames = this.state === "attack" ? this.IMAGES_ATTACK : this.IMAGES_WALKING;
      this.playAnimation(frames);
    }, 100);
  }

  update() {
    if (this.dead) return;

    if (!this._initd) {
      this._initd = true;
      if (this.x < this.patrolMinX) this.x = this.patrolMinX;
      if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
      this._dir = -1;
    }

    const now = Date.now();
    const c = this.world?.character;

    if (this.attacking && now < this.attackUntil) {
      if (c) {
        const myMid = this.x + this.width / 2;
        const hisMid = c.x + c.width / 2;
        const dir = hisMid < myMid ? -1 : 1;
        this.x += dir * this.attackSpeed;
        this.otherDirection = dir < 0;
      }
      this.clampToPatrol();
      this.state = "attack";
      return;
    }

    if (this.attacking && now < this.attackUntil) {
      let dir = this._dir ?? -1;
      if (c) {
        const myMid = this.x + this.width / 2;
        const hisMid = c.x + c.width / 2;
        dir = hisMid < myMid ? -1 : 1;
      }
      this.x += dir * this.attackSpeed;

      this.otherDirection = dir < 0;

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
    this.x += (this._dir ?? -1) * this.speed;
    this.otherDirection = (this._dir ?? -1) > 0;

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
    if (this.x < this.patrolMinX) this.x = this.patrolMinX;
    if (this.x + this.width > this.patrolMaxX) this.x = this.patrolMaxX - this.width;
  }

  takeHit(damage = 10) {
    if (this.dead) return;
    this.energy = Math.max(0, this.energy - damage);
    if (this.energy <= 0) this.die();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    if (this.spawnInterval) clearInterval(this.spawnInterval);

    this.loadImages(this.IMAGES_DEAD);
  }

  startSpawning() {
    if (this.spawnInterval || this.dead) return;
    this.spawnInterval = setInterval(() => this.spawnChick(), 2500);
  }

  spawnChick() {
    if (!this.world || this.dead) return;

    const ground = this.world?.character?.groundBottom || 417;
    const rawY = this.y + this.height - 10;
    const spawnY = Math.min(rawY, ground - 120); // mind. 120px Fallhöhe
    const spawnX = this.x + this.width / 2 - 10;

    const chick = new Chick(spawnX, 0.6 + Math.random() * 0.6);
    chick.world = this.world;
    chick.startFall(spawnY);
    this.world.level.enemies.push(chick);
  }
}
