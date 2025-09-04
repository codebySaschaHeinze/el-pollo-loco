const LEVEL_WIDTH = 8000;
const endboss = new Endboss();
endboss.x = LEVEL_WIDTH;

const BOTTLE_COUNT = 20;
const bottlePickups = [];
const step = Math.floor(LEVEL_WIDTH / BOTTLE_COUNT + 1);

for (let i = 0; i < BOTTLE_COUNT; i++) {
  const base = 200 + (i + 1) * step;
  const jitter = Math.floor(Math.random() * Math.max(80, step - 300)) - 40;
  bottlePickups.push(new Bottles(base + jitter));
}

const COIN_GROUPS = 10;
const GROUP_SIZE = 3;
const COIN_GAP_X = 60;
const COIN_MARGIN = 200;

const coinPickups = [];
const usableWidth = LEVEL_WIDTH - COIN_MARGIN * 2;
const groupStride = Math.floor(usableWidth / COIN_GROUPS);

for (let g = 0; g < COIN_GROUPS; g++) {
  const base = COIN_MARGIN + g * groupStride;
  const jitter = Math.floor(groupStride * 0.3 * (Math.random() * 2 - 1));
  const groupX = Math.max(120, Math.min(LEVEL_WIDTH - 120 - (GROUP_SIZE - 2) * COIN_GAP_X, base + jitter));

  for (let i = 0; i < GROUP_SIZE; i++) {
    const x = groupX + i * COIN_GAP_X;
    coinPickups.push(new Coins(x));
  }
}

const sign1 = new WarningSign(endboss.x - 600);
const sign2 = new AdventureSign(endboss.x - 7700);

const clouds = [
  new Cloud(LEVEL_WIDTH, 100),
  new Cloud(LEVEL_WIDTH, 550),
  new Cloud(LEVEL_WIDTH, 1000),
  new Cloud(LEVEL_WIDTH, 1450),
  new Cloud(LEVEL_WIDTH, 1900),
  new Cloud(LEVEL_WIDTH, 2350),
  new Cloud(LEVEL_WIDTH, 2800),
  new Cloud(LEVEL_WIDTH, 3250),
  new Cloud(LEVEL_WIDTH, 3700),
  new Cloud(LEVEL_WIDTH, 4150),
  new Cloud(LEVEL_WIDTH, 4600),
  new Cloud(LEVEL_WIDTH, 5050),
  new Cloud(LEVEL_WIDTH, 5500),
  new Cloud(LEVEL_WIDTH, 5950),
  new Cloud(LEVEL_WIDTH, 6400),
  new Cloud(LEVEL_WIDTH, 6850),
  new Cloud(LEVEL_WIDTH, 7300),
  new Cloud(LEVEL_WIDTH, 7750),
];

const backgrounds = [
  new BackgroundObjects("assets/imgs/5_background/layers/air.png", -1240),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", -1240),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", -1240),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", -1240),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", -100),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", -100),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", -100),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", -100),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 1340),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 1340),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 1340),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 1340),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 2780),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 2780),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 2780),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 2780),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 4220),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 4220),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 4220),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 4220),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 5660),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 5660),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 5660),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 5660),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 7100),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 7100),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 7100),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 7100),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 8540),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 8540),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 8540),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 8540),
];

backgrounds.push(sign1);
backgrounds.push(sign2);

const enemies = [
  new Chicken(1060),
  new Chicken(1390),
  new Chicken(1720),
  new Chicken(2050),
  new Chicken(2380),
  new Chicken(2710),
  new Chicken(3040),
  new Chicken(3370),
  new Chicken(3700),
  new Chicken(4030),
  new Chicken(4360),
  new Chicken(4690),
  new Chicken(5020),
  new Chicken(5350),
  new Chicken(5680),
  new Chicken(6010),
  new Chicken(6340),
  new Chicken(6670),
  new Chicken(7000),
  new Chicken(7330),
  new Chicken(7660),
  new Chicken(7990),
  new Chicken(8320),
  new Chicken(8650),
  new Chicken(8980),
  new Chicken(9310),
  new Chicken(9640),
  new Chicken(9970),
  new Chicken(10300),
  new Chicken(10630),
  new Chicken(10960),
  new Chicken(11290),
  new Chicken(11620),
  new Chicken(11950),
];
enemies.push(endboss);

const level1 = new Level(enemies, clouds, backgrounds, bottlePickups, coinPickups);
