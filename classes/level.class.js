class Level {
  enemies;
  clouds;
  backgroundObjects;
  bottlePickups = [];
  coinPickups = [];
  level_end_x = 8000;

  constructor(enemies, clouds, backgroundObjects, bottlePickups = [], coinPickups = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.bottlePickups = bottlePickups;
    this.coinPickups = coinPickups;
  }
}
