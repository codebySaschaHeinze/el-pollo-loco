/**
 * Level configuration aggregating all entities and assets for a stage.
 * Holds enemies, clouds, background/foreground objects, pickups, birds, and level length.
 * Also derives the total number of coins for HUD/progression.
 * @class
 */
class Level {
  /** All enemy entities present in the level. @type {Array<Object>} */
  enemies;

  /** Cloud instances for ambient sky movement. @type {Array<Object>} */
  clouds;

  /** Background objects drawn behind gameplay elements. @type {Array<Object>} */
  backgroundObjects;

  /** Bottle pickup instances. @type {Array<Object>} */
  bottlePickups = [];

  /** Coin pickup instances. @type {Array<Object>} */
  coinPickups = [];

  /** Foreground objects drawn in front of gameplay elements. @type {Array<Object>} */
  foregroundObjects = [];

  /** Ambient birds (decorative). @type {Array<Object>} */
  birds = [];

  /** Horizontal end position for the level (camera/character limit). @type {number} */
  level_end_x = 8000;

  /**
   * Creates a Level with the provided entity groups.
   * @param {Array<Object>} enemies - Enemy entities.
   * @param {Array<Object>} clouds - Cloud sprites.
   * @param {Array<Object>} backgroundObjects - Background layers/props.
   * @param {Array<Object>} [bottlePickups=[]] - Bottle pickups.
   * @param {Array<Object>} [coinPickups=[]] - Coin pickups.
   * @param {Array<Object>} [foregroundObjects=[]] - Foreground layers/props.
   * @param {Array<Object>} [birds=[]] - Decorative birds.
   */
  constructor(enemies, clouds, backgroundObjects, bottlePickups = [], coinPickups = [], foregroundObjects = [], birds = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.bottlePickups = bottlePickups;
    this.coinPickups = coinPickups;
    this.foregroundObjects = foregroundObjects;
    this.birds = birds;
    /** Total number of coins present in the level. @type {number} */
    this.totalCoins = coinPickups.length;
  }
}
