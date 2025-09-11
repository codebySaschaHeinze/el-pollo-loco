/**
 * Level 1 content assembly: spawns enemies, props, pickups, ambience, and composes a Level instance.
 * All values are deterministic except for small jitter used to add variety to placements.
 */

/** Total playable world width in pixels. */
const LEVEL_WIDTH = 8000;

/** Endboss instance positioned at the level end. @type {Endboss} */
const endboss = new Endboss();
endboss.x = LEVEL_WIDTH;

/** Number of bottle pickups to distribute across the level. */
const BOTTLE_COUNT = 20;

/** Collection of bottle pickups placed along the level. @type {Bottles[]} */
const bottlePickups = [];

/** Horizontal spacing baseline used for bottle distribution. */
const step = Math.floor(LEVEL_WIDTH / BOTTLE_COUNT + 1);

for (let i = 0; i < BOTTLE_COUNT; i++) {
  const base = 200 + (i + 1) * step;
  const jitter = Math.floor(Math.random() * Math.max(80, step - 300)) - 40;
  bottlePickups.push(new Bottles(base + jitter));
}

/** Number of coin groups to create. */
const COIN_GROUPS = 8;

/** Number of coins per group (randomized 3..4). */
const GROUP_SIZE = Math.floor(Math.random() * 2) + 3;

/** Horizontal spacing between coins within a group. */
const COIN_GAP_X = 60;

/** Left/right margin within which no coins spawn. */
const COIN_MARGIN = 200;

/** Collection of coin pickups arranged in groups. @type {Coins[]} */
const coinPickups = [];

/** Width available for distributing coin groups after margins. */
const usableWidth = LEVEL_WIDTH - COIN_MARGIN * 2;

/** Base stride between coin groups. */
const groupStride = Math.floor(usableWidth / COIN_GROUPS);

for (let g = 0; g < COIN_GROUPS; g++) {
  const base = COIN_MARGIN + g * groupStride;
  const jitter = Math.floor(groupStride * 0.3 * (Math.random() * 2 - 1));
  const groupX = Math.max(500, Math.min(LEVEL_WIDTH - 120 - (GROUP_SIZE - 2) * COIN_GAP_X, base + jitter));

  for (let i = 0; i < GROUP_SIZE; i++) {
    const x = groupX + i * COIN_GAP_X;
    coinPickups.push(new Coins(x));
  }
}

/** Number of ambient birds to spawn across the sky. */
const BIRD_COUNT = 12;

/** Bird instances. @type {Birds[]} */
const birds = [];

/** Base stride to distribute birds from left to right. */
const stride = Math.floor(LEVEL_WIDTH / (BIRD_COUNT - 2));

for (let i = 0; i < BIRD_COUNT; i++) {
  const jitter = Math.random() * 200 - 100;
  const x = -400 + i * stride + jitter;
  birds.push(new Birds(LEVEL_WIDTH, x));
}

/** Warning/guide signs placed along the path. */
const sign1 = new WarningSign(endboss.x - 600);
const sign2 = new AdventureSign(330);
const sign3 = new KeepGoingSign(endboss.x - 4000);

/** Wheels and props scattered through the level. */
const wheel1 = new Wheel1(845);
const wheel2 = new Wheel1(3040);
const wheel3 = new Wheel1(3750);
const wheel4 = new Wheel1(6400);
const wheel5 = new Wheel1(5900);
const wheel6 = new Wheel1(7200);

const wheel7 = new Wheel2(430);
const wheel8 = new Wheel2(2250);
const wheel9 = new Wheel2(3400);
const wheel10 = new Wheel2(6900);
const wheel11 = new Wheel2(5260);
const wheel12 = new Wheel2(7200);

const wheelbarrow1 = new Wheelbarrow(1550);
const wheelbarrow2 = new Wheelbarrow(6600);
const wheelbarrow3 = new Wheelbarrow(7010);

const barrel1 = new Barrel(800);
const barrel2 = new Barrel(1640);
const barrel3 = new Barrel(3650);
const barrel4 = new Barrel(5200);
const barrel5 = new Barrel(6950);

const lantern1 = new LanternSmall(813);
const lantern2 = new LanternSmall(1653);
const lantern3 = new LanternSmall(3663);
const lantern4 = new LanternSmall(5213);
const lantern5 = new LanternSmall(6963);

const lantern6 = new LanternBig(200);
const lantern7 = new LanternBig(900);
const lantern8 = new LanternBig(1600);
const lantern9 = new LanternBig(2300);
const lantern10 = new LanternBig(3000);
const lantern11 = new LanternBig(3700);
const lantern12 = new LanternBig(4400);
const lantern13 = new LanternBig(5100);
const lantern14 = new LanternBig(5800);
const lantern15 = new LanternBig(6500);
const lantern16 = new LanternBig(7200);
const lantern17 = new LanternBig(7900);

const guitar1 = new Guitar(190);
const guitar2 = new Guitar(2600);
const guitar3 = new Guitar(4020);
const guitar4 = new Guitar(6090);
const guitar5 = new Guitar(7445);

const bigSignLegend = new BigSignLegend(330);

/** Decorative saloon building positioned slightly off-screen to the left. @type {Saloon} */
const saloon = new Saloon("assets/imgs/extras/saloon.png", -420);

/** Foreground-only lanterns that render in front of player/enemies. @type {LanternBigForeground[]} */
const foreground = [
  new LanternBigForeground(230),
  new LanternBigForeground(930),
  new LanternBigForeground(1630),
  new LanternBigForeground(2330),
  new LanternBigForeground(3030),
  new LanternBigForeground(3730),
  new LanternBigForeground(4430),
  new LanternBigForeground(5130),
  new LanternBigForeground(5830),
  new LanternBigForeground(6530),
  new LanternBigForeground(7230),
  new LanternBigForeground(7930),
];

const skull1 = new Skull(endboss.x - 590);

/** Cloud layer instances spaced across the level. @type {Cloud[]} */
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

/**
 * Background parallax layers and static props (added later).
 * Order matters: farthest (air) first, then third/second/first layers repeating across width.
 * @type {BackgroundObjects[]|Array<DrawableObjects>}
 */
const backgrounds = [
  new BackgroundObjects("assets/imgs/5_background/layers/air.png", -1540),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", -1540),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", -1540),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", -1540),

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
backgrounds.push(sign3);

backgrounds.push(wheel1);
backgrounds.push(wheel2);
backgrounds.push(wheel3);
backgrounds.push(wheel4);
backgrounds.push(wheel5);
backgrounds.push(wheel6);
backgrounds.push(wheel7);
backgrounds.push(wheel8);
backgrounds.push(wheel9);
backgrounds.push(wheel10);
backgrounds.push(wheel11);
backgrounds.push(wheel12);

backgrounds.push(wheelbarrow1);
backgrounds.push(wheelbarrow2);
backgrounds.push(wheelbarrow3);

backgrounds.push(barrel1);
backgrounds.push(barrel2);
backgrounds.push(barrel3);
backgrounds.push(barrel4);
backgrounds.push(barrel5);

backgrounds.push(lantern1);
backgrounds.push(lantern2);
backgrounds.push(lantern3);
backgrounds.push(lantern4);
backgrounds.push(lantern5);

backgrounds.push(lantern6);
backgrounds.push(lantern7);
backgrounds.push(lantern8);
backgrounds.push(lantern9);
backgrounds.push(lantern10);
backgrounds.push(lantern11);
backgrounds.push(lantern12);
backgrounds.push(lantern13);
backgrounds.push(lantern14);
backgrounds.push(lantern15);
backgrounds.push(lantern16);
backgrounds.push(lantern17);

backgrounds.push(guitar1);
backgrounds.push(guitar2);
backgrounds.push(guitar3);
backgrounds.push(guitar4);
backgrounds.push(guitar5);

backgrounds.push(skull1);

backgrounds.push(bigSignLegend);

backgrounds.push(saloon);

/** Enemy roster for the level. @type {(Chicken|Endboss)[]} */
const enemies = [
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
];

enemies.push(endboss);

/**
 * Final Level instance composed from all assembled entities.
 * Note: Extra trailing argument is ignored by Level's constructor signature.
 * @type {Level}
 */
const level1 = new Level(enemies, clouds, backgrounds, bottlePickups, coinPickups, foreground, birds, saloon);
