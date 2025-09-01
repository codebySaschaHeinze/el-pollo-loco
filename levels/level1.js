const LEVEL_WIDTH = 12000;
const endboss = new Endboss();
endboss.x = LEVEL_WIDTH + 350; // ggf. feintunen

const clouds = [
  new Cloud(LEVEL_WIDTH, 100),
  new Cloud(LEVEL_WIDTH, 1200),
  new Cloud(LEVEL_WIDTH, 2400),
  new Cloud(LEVEL_WIDTH, 3600),
  new Cloud(LEVEL_WIDTH, 5000),
  new Cloud(LEVEL_WIDTH, 6500),
  new Cloud(LEVEL_WIDTH, 8000),
  new Cloud(LEVEL_WIDTH, 9500),
  new Cloud(LEVEL_WIDTH, 10800),
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

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 9980),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 9980),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 9980),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 9980),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 11420),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 11420),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 11420),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 11420),

  new BackgroundObjects("assets/imgs/5_background/layers/air.png", 12860),
  new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 12860),
  new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 12860),
  new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 12860),
];

const level1 = new Level([new Chicken(), new Chicken(), new Chicken(), endboss], clouds, backgrounds);
