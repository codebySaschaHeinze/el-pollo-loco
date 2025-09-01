class Character extends MovableObjects {
  y = 180;
  speed = 6;
  energy = 100;
  lastHitAt = 0;
  invulnMs = 700;
  hurtMs = 350;
  dead = false;
  moveInterval = null;
  animInterval = null;
  deathDone = false;
  deathIndex = 0;
  ascendStartAt = 0; // Startzeit des Schwebens
  ascendDuration = 2000; // ms bis komplett transparent
  ascendDistance = 170; // px nach oben
  bodyBaseY = 0; // Start-Y für die Schwebeberechnung
  lastVisibleDeadIdx = 0; // letzter sichtbarer Dead-Frame (siehe unten)

  IMAGES_WALKING = [
    "assets/imgs/2_character_pepe/2_walk/w-21.png",
    "assets/imgs/2_character_pepe/2_walk/w-22.png",
    "assets/imgs/2_character_pepe/2_walk/w-23.png",
    "assets/imgs/2_character_pepe/2_walk/w-24.png",
    "assets/imgs/2_character_pepe/2_walk/w-25.png",
    "assets/imgs/2_character_pepe/2_walk/w-26.png",
  ];

  IMAGES_JUMPING = [
    "assets/imgs/2_character_pepe/3_jump/j-31.png",
    "assets/imgs/2_character_pepe/3_jump/j-32.png",
    "assets/imgs/2_character_pepe/3_jump/j-33.png",
    "assets/imgs/2_character_pepe/3_jump/j-34.png",
    "assets/imgs/2_character_pepe/3_jump/j-35.png",
    "assets/imgs/2_character_pepe/3_jump/j-36.png",
    "assets/imgs/2_character_pepe/3_jump/j-37.png",
    "assets/imgs/2_character_pepe/3_jump/j-38.png",
    "assets/imgs/2_character_pepe/3_jump/j-39.png",
  ];

  IMAGES_DEAD = [
    "assets/imgs/2_character_pepe/5_dead/d-51.png",
    "assets/imgs/2_character_pepe/5_dead/d-52.png",
    "assets/imgs/2_character_pepe/5_dead/d-53.png",
    "assets/imgs/2_character_pepe/5_dead/d-54.png",
    "assets/imgs/2_character_pepe/5_dead/d-55.png",
    "assets/imgs/2_character_pepe/5_dead/d-56.png",
  ];

  IMAGES_HURT = [
    "assets/imgs/2_character_pepe/4_hurt/h-41.png",
    "assets/imgs/2_character_pepe/4_hurt/h-42.png",
    "assets/imgs/2_character_pepe/4_hurt/h-43.png",
  ];
  currentImage = 0;
  world;
  constructor(keyboard) {
    super().loadImage("assets/imgs/2_character_pepe/1_idle/idle/i-1.png");
    this.width = 80;
    this.height = 150;
    this.groundBottom = 365 + 52;
    this.y = this.groundBottom - this.height;
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.lastVisibleDeadIdx = this.IMAGES_DEAD.length - 4;
    this.applGravity();
    this.keyboard = keyboard;
    this.animate();
  }

  isInvulnerable() {
    return Date.now() - (this.lastHitAt || 0) < this.invulnMs;
  }

  hit(damage = 10) {
    if (this.isInvulnerable() || (this.isDead && this.isDead())) return false;
    this.lastHitAt = Date.now();
    this.energy = Math.max(0, this.energy - damage);

    if (this.energy <= 0) {
      this.die();
    }

    return true;
  }

  isHurt() {
    return Date.now() - (this.lastHitAt || 0) < this.hurtMs;
  }

  die() {
    if (this.dead) return;
    this.dead = true;

    this.y = this.groundBottom - this.height;
    this.speedY = 0;
    this.speed = 0;
    this.acceleration = 0;
  }

  isDead() {
    return this.dead || this.energy <= 0;
  }

  isAboveGround() {
    if (this.isDead()) return false;
    return this.y + this.height < this.groundBottom;
  }

  animate() {
    this.moveInterval = setInterval(() => {
      if (this.isDead()) return;

      if (this.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
      }
      if (this.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
      }
      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.jump();
      }
      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    this.animInterval = setInterval(() => {
      if (this.isDead()) {
        if (!this.deathDone) {
          const lastIdx = this.lastVisibleDeadIdx;
          const idx = Math.min(this.deathIndex, lastIdx);
          const frame = this.IMAGES_DEAD[idx];

          if (frame) this.img = this.imageCache[frame];
          this.deathIndex++;

          if (this.deathIndex > lastIdx) {
            this.deathDone = true;

            this.img = this.imageCache[this.IMAGES_DEAD[lastIdx]];

            clearInterval(this.animInterval);
          }
        }
        return;
      }

      if (this.isHurt && this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 100);
  }

  draw(ctx) {
    if (this.dead && this.deathDone) {
      if (!this.ascendStartAt) {
        this.ascendStartAt = Date.now();
        this.bodyBaseY = this.y;
      }

      const elapsed = Date.now() - this.ascendStartAt;
      const t = Math.min(elapsed / this.ascendDuration, 1);

      const ease = 1 - (1 - t) * (1 - t);
      const alpha = 1 - t;

      this.y = this.bodyBaseY - this.ascendDistance * ease;

      const last = this.IMAGES_DEAD[this.lastVisibleDeadIdx];
      const cached = this.imageCache[last];
      if (cached) this.img = cached;

      ctx.save();
      ctx.globalAlpha = alpha;
      super.draw(ctx);
      ctx.restore();

      if (t >= 1) this.gone = true;

      return;
    }

    super.draw(ctx);
  }

  fallingDown() {
    return this.speedY < 0;
  }

  bounceOn(enemy) {
    this.y = enemy.y - this.height;
    this.speedY = 15;
  }
}
