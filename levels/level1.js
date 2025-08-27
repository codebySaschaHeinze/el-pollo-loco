const level1 = new Level(
  [new Chicken(), new Chicken(), new Chicken()],
  [new Cloud()],
  [
    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 0),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 0),

    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 1440),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 1440),

    new BackgroundObjects("assets/imgs/5_background/layers/air.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/3_third_layer/full.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/2_second_layer/full.png", 2880),
    new BackgroundObjects("assets/imgs/5_background/layers/1_first_layer/full.png", 2880),
  ]
);
