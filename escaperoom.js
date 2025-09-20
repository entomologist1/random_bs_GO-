/*
i want to make an escape room. alas. i am rlly rlly bad at planning interesting stories
Q_Q
i still need to make objects work like in general. and also make an inventory. and whatnot
*/

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

class mainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
  }

  init() {
    this.currentAreaIndex = 1;
    this.areaObjects = [];
    this.scrollSpeed = 8; // how fast cameraTarget moves
    this.edgeThreshold = 75; // px from edge before scrolling starts
  }

  preload() {
    for (const [key, area] of Object.entries(areaInfo)) {
      this.load.image("bg" + key, area.background);
      for (const obj of area.objects) {
        this.load.image(obj.spriteKey, obj.spritePath);
      }
    }
  }

  create() {
    this.reloadNewArea(this.currentAreaIndex);

    //DEBUGGING lol
    this.input.keyboard.on("keydown-RIGHT", () => {
      this.currentAreaIndex++;
      if (this.currentAreaIndex > Object.keys(areaInfo).length) {
        this.currentAreaIndex = 1;
      }
      this.reloadNewArea(this.currentAreaIndex);
    });
  }

  update() {
    this.updateCameraFollow();
  }
 
  reloadNewArea(index, spawnPoint = 0) {
    this.loadArea(index);
    this.loadAreaObjects(index);
    this.loadPlayerMovement?.();
    this.setupCamera(index, spawnPoint);
  }

  setupCamera(index, spawnPointIndex = 0) {
    const area = areaInfo[index];
    this.camera = this.cameras.main;
    let currentSpawn = area.spawnPoints[spawnPointIndex];

    //current area's width/height
    const bgWidth = this.backgroundImage.width;
    const bgHeight = this.backgroundImage.height;
    
    console.log(currentSpawn, bgWidth  / 2, bgHeight  / 2)

    //bounds for clamping
    this.areaBounds = new Phaser.Geom.Rectangle(0, 0, bgWidth, bgHeight);
    this.camera.setBounds(
      this.areaBounds.x,
      this.areaBounds.y,
      this.areaBounds.width,
      this.areaBounds.height
    );

    //cameraTarget for camera to follow
    if (!this.cameraTarget) {
      this.cameraTarget = this.add.zone(bgWidth  / 2, bgHeight  / 2, 1, 1);
      this.cameraTarget.setOrigin(0.5, 0.5);
      this.camera.startFollow(this.cameraTarget, true, 0.15, 0.15);
    } else {
      this.cameraTarget.x = currentSpawn.x;
      this.cameraTarget.y = currentSpawn.y;
    }
  }

  updateCameraFollow() {
    if (!this.input.activePointer) return;
    const pointer = this.input.activePointer;

    let moveX = 0;
    let moveY = 0;

    // detect edges
    if (pointer.x < this.edgeThreshold) moveX = -this.scrollSpeed;
    else if (pointer.x > GAME_WIDTH - this.edgeThreshold)
      moveX = this.scrollSpeed;

    if (pointer.y < this.edgeThreshold) moveY = -this.scrollSpeed;
    else if (pointer.y > GAME_HEIGHT - this.edgeThreshold)
      moveY = this.scrollSpeed;

    // move cameraTarget and clamp to current area's bounds
    if (moveX !== 0 || moveY !== 0) {
      this.cameraTarget.x = Phaser.Math.Clamp(
        this.cameraTarget.x + moveX,
        this.areaBounds.x + GAME_WIDTH / 2,
        this.areaBounds.right - GAME_WIDTH / 2
      );
      this.cameraTarget.y = Phaser.Math.Clamp(
        this.cameraTarget.y + moveY,
        this.areaBounds.y + GAME_HEIGHT / 2,
        this.areaBounds.bottom - GAME_HEIGHT / 2
      );
    }
  }

  loadArea(index) {
    const area = areaInfo[index];
    if (!area) return;

    if (this.backgroundImage) this.backgroundImage.destroy();
    if (this.areaText) this.areaText.destroy();

    this.backgroundImage = this.add.image(0, 0, "bg" + index).setOrigin(0, 0); // top-left origin for bounds calculations

    this.areaText = this.add
      .text(20, 20, area.areaName, {
        fontSize: "24px",
        fill: "#fff"
      })
      .setScrollFactor(0);
  }

  loadAreaObjects(index) {
    const area = areaInfo[index];
    if (!area) return;

    if (this.areaObjects) {
      this.areaObjects.forEach((obj) => obj.destroy());
    }
    this.areaObjects = [];

    for (const obj of area.objects) {
      obj.spawn(this);
      this.areaObjects.push(obj);
    }
  }

  loadPlayerMovement() {
    console.log("Player movement here");
  }

  shutdown() {}
}

class AreaObject {
  constructor(type, spriteKey, spritePath, position) {
    this.type = type;
    this.spriteKey = spriteKey;
    this.spritePath = spritePath;
    this.position = position; 
    this.sprite = null;
  }

  spawn(scene) {
    this.sprite = scene.add.sprite(
      this.position.x,
      this.position.y,
      this.spriteKey
    );
  }

  interact() {
    console.log("interactable");
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

class Area {
  constructor(
    areaName = "defaultName",
    background = "defaultBackground.png",
    objects = [],
    spawnPoints = [new Phaser.Math.Vector2(0, 0)], //default spawn 
  ) {
    this.areaName = areaName;
    this.background = background;
    this.objects = objects;
    this.spawnPoints = spawnPoints;
  }
}

let areaInfo = {
  1: new Area(
    "area one",
    "https://images.pexels.com/photos/1590549/pexels-photo-1590549.jpeg?cs=srgb&dl=pexels-iriser-1590549.jpg&fm=jpg",
    [
      new AreaObject(
        "npc",
        "npc1",
        "assets/npc1.png",
        new Phaser.Math.Vector2(200, 300)
      ),
      new AreaObject(
        "item",
        "chest",
        "assets/chest.png",
        new Phaser.Math.Vector2(500, 400)
      )
    ],
    [new Phaser.Math.Vector2(1000, 1000)]
  ),
  2: new Area(
    "area two",
    "https://static.vecteezy.com/system/resources/previews/017/646/920/non_2x/flower-garden-bokeh-soft-light-abstract-background-eps-10-illustration-bokeh-particles-background-decoration-vector.jpg",
    [
      new AreaObject(
        "npc",
        "npc2",
        "assets/npc2.png",
        new Phaser.Math.Vector2(250, 250)
      )
    ],
    [new Phaser.Math.Vector2(0, 500)]
  ),
  3: new Area(
    "area three",
    "https://codetheweb.blog/assets/img/posts/css-advanced-background-images/cover.jpg",
    [
      new AreaObject(
        "item",
        "potion",
        "assets/potion.png",
        new Phaser.Math.Vector2(400, 500)
      )
    ],
    [new Phaser.Math.Vector2(200, 0)]
  )
};

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#2d2d8d",
  parent: "phaser-example",
  scene: [mainScene]
};

const game = new Phaser.Game(config);

