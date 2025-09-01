const LEVEL_WIDTH = 8000;
const endboss = new Endboss();
endboss.x = LEVEL_WIDTH + 350; // ggf. feintunen

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

const level1 = new Level([new Chicken(), new Chicken(), new Chicken(), endboss], clouds, backgrounds);
level1.level_end_x = LEVEL_WIDTH;
