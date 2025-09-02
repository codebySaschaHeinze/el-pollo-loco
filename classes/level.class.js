class Level {
  enemies;
  clouds;
  backgroundObjects;
  bottlePickups = [];
  level_end_x = 8000;

  constructor(enemies, clouds, backgroundObjects, bottlePickups = []) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.bottlePickups = bottlePickups;
  }
}
