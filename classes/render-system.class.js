/**
 * Renders background/actors/foreground and HUD onto the canvas.
 * Keeps drawing helpers (flip, group) out of the World class.
 */
class RenderSystem {
  /** */
  constructor(world) {
    this.w = world;
    this.ctx = world.ctx;
  }

  /** Clears canvas and applies camera. */
  beginFrame() {
    this.ctx.clearRect(0, 0, this.w.canvas.width, this.w.canvas.height);
    this.ctx.translate(this.w.camera_x, 0);
  }

  /** Background, parallax and pickups. */
  drawBack() {
    this.addList(this.w.level.backgroundObjects);
    this.addList(this.w.level.saloon);
    if (!this.w.paused) this.updateList(this.w.level.clouds);
    this.addList(this.w.level.clouds);
    if (!this.w.paused) this.updateList(this.w.level.birds);
    this.addList(this.w.level.birds);
    this.addList(this.w.level.bottlePickups);
    this.addList(this.w.level.coinPickups);
  }

  /** Enemies, boss HUD, character, projectiles. */
  drawActors() {
    if (!this.w.paused) this.updateList(this.w.level.enemies);
    this.addList(this.w.level.enemies);
    const boss = this.w.getBoss();
    if (boss?.healthBar) this.addOne(boss.healthBar);
    this.addOne(this.w.character);
    if (!this.w.paused) this.w.character.updateStepSound();
    else this.w.character.pauseStep();
    this.addList(this.w.throwableObjects);
    this.w.pruneThrowables();
  }

  /** Foreground and collision step; reset camera. */
  drawFront() {
    this.addList(this.w.level.foregroundObjects);
    if (!this.w.paused && !this.w.ending) this.w.checkCollisions();
    this.ctx.translate(-this.w.camera_x, 0);
  }

  /** HUD and end checks. */
  drawHudAndEnd() {
    this.addOne(this.w.statusBar);
    this.addOne(this.w.coinHUD);
    this.addOne(this.w.bottleBar);
    this.w.checkEndConditions();
  }

  /** Adds a list of drawables. */
  addList(list) {
    list?.forEach((o) => this.addOne(o));
  }

  /** Adds single drawable with optional mirroring. */
  addOne(o) {
    if (!o) return;
    if (o.otherDirection) this.flip(o);
    o.draw(this.ctx);
    if (o.otherDirection) this.flipBack(o);
  }

  /** Flips context and adjusts x. */
  flip(o) {
    this.ctx.save();
    this.ctx.translate(o.width, 0);
    this.ctx.scale(-1, 1);
    o.x = -o.x;
  }

  /** Restores context and x. */
  flipBack(o) {
    this.ctx.restore();
    o.x = -o.x;
  }

  /** Calls update() on list. */
  updateList(list) {
    list?.forEach((o) => o.update && o.update());
  }
}
