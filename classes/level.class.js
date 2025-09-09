class Level {
  enemies;
  clouds;
  backgroundObjects;
  bottlePickups = [];
  coinPickups = [];
  foregroundObjects = [];
  level_end_x = 8000;
  totalCoins = 0;
  birds = [];

  constructor(enemies, clouds, backgroundObjects, bottlePickups = [], coinPickups = [], foregroundObjects = [], birds = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.bottlePickups = bottlePickups;
    this.coinPickups = coinPickups;
    this.foregroundObjects = foregroundObjects;
    this.totalCoins = this.coinPickups.length;
    this.birds = birds;
  }
}
