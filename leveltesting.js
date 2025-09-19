

class mainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
  }

  create() {
    this.activeView = new mainView(this);
  }

  update(time, delta) {
    if (this.activeView && this.activeView.update) {
      this.activeView.update(time, delta);
    }
  }
}

//main menu/opening menu
class mainMenuView {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container();

    this.container.add(scene.add.rectangle(200, 200, 100, 100, 0xff0000));
    this.container.add(scene.add.rectangle(250, 150, 100, 100, 0xff0000));
  }

  update(time, delta) {
    //add animations/input handling
  }

  destroy() {
    this.container.destroy(true);
  }
}

//actual gameplay section
class mainView {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container();
    this.currentPhase = 1; // start at phase 1

    this.buildPhase(this.currentPhase);
  }

  // Clear the container and rebuild for the given phase
  buildPhase(phase) {
    this.container.removeAll(true); // remove existing shapes

    switch (phase) {
      case 1:
        this.container.add(
          this.scene.add.rectangle(350, 200, 150, 100, 0x00ff00)
        );
        break;

      case 2:
        this.container.add(
          this.scene.add.rectangle(250, 150, 100, 100, 0xff0000)
        );
        this.container.add(
          this.scene.add.rectangle(400, 200, 100, 100, 0xff0000)
        );
        break;

      case 3:
        for (let i = 0; i < 3; i++) {
          this.container.add(
            this.scene.add.rectangle(200 + i * 120, 250, 100, 100, 0x0000ff)
          );
        }
        break;

      case 4:
        for (let i = 0; i < 4; i++) {
          this.container.add(
            this.scene.add.rectangle(150 + i * 120, 300, 80, 80, 0xffff00)
          );
        }
        break;

      case 5:
        for (let i = 0; i < 5; i++) {
          this.container.add(
            this.scene.add.rectangle(100 + i * 120, 350, 60, 60, 0xff00ff)
          );
        }
        break;
    }
  }

  // Call this to move to the next phase
  nextPhase() {
    this.currentPhase++;
    if (this.currentPhase > 5) {
      this.currentPhase = 1; // loop back to 1
    }
    this.buildPhase(this.currentPhase);
  }

  update(time, delta) {
    // Example: rotate the whole container
    this.container.angle += 0.1;
  }

  destroy() {
    this.container.destroy(true);
  }
}

//settings switch
class settingsView {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container();

    this.container.add(scene.add.rectangle(250, 150, 100, 100, 0xffffff));
  }

  update(time, delta) {}

  destroy() {
    this.container.destroy(true);
  }
}

//guiOverlay for mainView
class mainGUIOverlay extends Phaser.Scene {
  constructor() {
    //call super/set up var
  }
 
  preload() {
    //loading images/stuff it needs
  }

  create() {
    //on creation AFTER preload
  }

  update(time, delta) {
    //animations and whatever
  }
}

//format for storing levelInfo
class levelInfo {
  constructor(roomFiles = [], roomKeys = [], timer = null) {
    this.roomFiles = roomFiles;
    this.roomKeys = roomKeys;
    this.timer = timer;
  }
}

//actual dict for storting levelInfo
const listOfLevels = {
  1: new levelInfo(),
  2: new levelInfo(),
  3: new levelInfo(),
  4: new levelInfo(),
  5: new levelInfo()
};

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1000,
    height: 600
  },
  scene: [mainScene]
};

const game = new Phaser.Game(config);


