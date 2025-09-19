/*
im lazy so i just copy and paste this whenever i have ideas
*/

class myScene extends Phaser.Scene {
  constructor() {
    super({ key: "myScene" });
  }

  init() {}

  preload() {}

  create() {}

  update() {}
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#222",
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1000,
    height: 600
  },
  scene: [myScene]
};

const game = new Phaser.Game(config);


