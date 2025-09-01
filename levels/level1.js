const level1 = new Level(
  [new Chicken(), new Chicken(), new Chicken(), new Endboss()],
  [new Cloud(720, 100), new Cloud(720, 400), new Cloud(720, 800), new Cloud(720, 1200)],
  [
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
  ]
);
