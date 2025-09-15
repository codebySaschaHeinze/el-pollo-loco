/**
 * Spawns throwable bottles with direction-aware velocity and longer airtime.
 * Keeps input-to-projectile logic out of the World class.
 */
class ThrowSystem {
  /** */
  constructor(world) {
    this.w = world;
  }

  /** Creates a bottle if SPACE pressed and inventory allows. */
  tick() {
    const ch = this.w.character;
    if (this.w.paused || this.w.ending) return;
    if (!this.w.keyboard.SPACE || !ch.canThrowBottle?.()) return;

    const left = !!ch.otherDirection,
      dir = left ? -1 : 1;
    const xOff = left ? -20 : 50,
      yOff = 50;

    const b = new ThrowableObjects(ch.x + xOff, ch.y + yOff);
    b.world = this.w;
    b.otherDirection = left;
    b.vx = 16 * dir; // weiter fliegen
    b.speedY = 10; // flacher Wurf
    b.acceleration = 0.85; // längere Airtime
    if (typeof b.speedX === "number") b.speedX = b.vx;

    this.w.throwableObjects.push(b);
    if (ch.useBottle?.()) this.w.updateBottleBar();
  }
}
