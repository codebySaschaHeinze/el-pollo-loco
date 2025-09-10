class Level {
  enemies;
  clouds;
  backgroundObjects;
  bottlePickups = [];
  coinPickups = [];
  foregroundObjects = [];
  birds = [];
  level_end_x = 8000;

  constructor(enemies, clouds, backgroundObjects, bottlePickups = [], coinPickups = [], foregroundObjects = [], birds = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.bottlePickups = bottlePickups;
    this.coinPickups = coinPickups;
    this.foregroundObjects = foregroundObjects;
    this.birds = birds;
    this.totalCoins = coinPickups.length;
  }
}
