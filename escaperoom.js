/*
i want to make an escape room. alas. i am rlly rlly bad at planning interesting stories
Q_Q
i still need to make objects work like in general. and also make an inventory. and whatnot
*/

/*
options:

- make inventory of no items

- add (item) to inventory
- remove (item) from inventory
- check if (itemKey) is in inventory
- list all items
*/
class inventory {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
    console.log(`${item.spriteKey} added to inventory`);
  }

  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      console.log(`${item.spriteKey} removed from inventory`);
    }
  }

  hasItem(itemKey) {
    return this.items.some(i => i.spriteKey === itemKey);
  }

  listItems() {
    return this.items.map(i => i.spriteKey);
  }
}

/*
options:
- create objectManager with (scene)

- set (area) and load all objects in it
- add (areaObject) to current area
- remove (areaObject) from current area
- clear all areaObjects from current area
- move (areaObject) to a (newPosition) with an animation of length (duration) in current area
- enable interaction for (areaObject) in current area
- disable interaction for (areaObject) in current area
- get areaObjects of (type) in current area
- get areaObjects of (key) in current area
*/
class objectManager {
  constructor(scene) {
    this.scene = scene;
    this.currentArea = null;
  }

  setArea(area) {
    if (!(area instanceof Area)) {
      console.warn("provide a valid Area");
      return;
    }

    //clear previous objects from scene
    if (this.currentArea) {
      this.currentArea.objects.forEach((obj) => obj.destroy());
    }

    this.currentArea = area;

    //spawn all objects in the scene
    this.currentArea.objects.forEach((obj) => obj.spawn(this.scene));
  }

  addObject(areaObject) {
    if (!this.currentArea) {
      console.warn("No current area set");
      return;
    }

    const obj = this.currentArea.addObject(areaObject);
    if (obj) obj.spawn(this.scene);
    return obj;
  }

  removeObject(areaObject) {
    if (!this.currentArea) return;

    areaObject.destroy();
    this.currentArea.removeObject(areaObject);
  }

  clearAll() {
    if (!this.currentArea) return;

    this.currentArea.objects.forEach((obj) => obj.destroy());
    this.currentArea.clearObjects();
  }

  moveObject(areaObject, newPosition, duration = 500) {
    if (!this.currentArea || !this.currentArea.objects.includes(areaObject))
      return;

    areaObject.move(newPosition, duration);
  }

  enableInteraction(areaObject) {
    if (!this.currentArea || !this.currentArea.objects.includes(areaObject))
      return;

    areaObject.enableInteraction();
  }

  disableInteraction(areaObject) {
    if (!this.currentArea || !this.currentArea.objects.includes(areaObject))
      return;

    areaObject.disableInteraction();
  }

  getObjectsByType(type) {
    if (!this.currentArea) return [];
    return this.currentArea.getObjectsByType(type);
  }

  getObjectByKey(spriteKey) {
    if (!this.currentArea) return null;
    return this.currentArea.getObjectByKey(spriteKey);
  }
}

//general phaser scene
class mainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
  }

  init() {
    this.currentAreaIndex = 1;
    this.scrollSpeed = 8;
    this.edgeThreshold = 75;
  }

  preload() {
    //this is just laoding all area images + objs images
    for (const [key, area] of Object.entries(areaInfo)) {
      this.load.image("bg" + key, area.background);
      for (const obj of area.objects) {
        this.load.image(obj.spriteKey, obj.spritePath);
      }
    }
  }

  create() {
    //create the objectManager (this handles all areas)
    this.objectManager = new objectManager(this);

    //load first area (by default/init its 1)
    this.reloadNewArea(this.currentAreaIndex);

    //DEBUG: cycle areas  right arrow
    addKeyInput(this, "RIGHT", () => {
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

  //handles moving between areas
  reloadNewArea(index, spawnPoint = 0) {
    //default spawn is the first one on list
    this.loadArea(index);
    this.loadAreaObjects(index);
    this.loadPlayerMovement?.();
    this.setupCamera(index, spawnPoint);
  }

  //these are helpers for reloadNewArea aka my personal checklist lol

  setupCamera(index, spawnPointIndex = 0) {
    //camera follows a zone tied to mouse and bound by bg width/height
    //

    const area = areaInfo[index];
    this.camera = this.cameras.main;
    let currentSpawn = area.spawnPoints[spawnPointIndex];

    const bgWidth = this.backgroundImage.width;
    const bgHeight = this.backgroundImage.height;

    //camera bounds
    this.areaBounds = new Phaser.Geom.Rectangle(0, 0, bgWidth, bgHeight);
    this.camera.setBounds(
      this.areaBounds.x,
      this.areaBounds.y,
      this.areaBounds.width,
      this.areaBounds.height
    );

    //create/move camera target
    if (!this.cameraTarget) {
      //this.cameraTarget = this.add.zone(bgWidth / 2, bgHeight / 2, 1, 1); //this sets to center of bg image
      this.cameraTarget = this.add.zone(currentSpawn.x, currentSpawn.y, 1, 1); //this sets to whatever spawnpoint is chosen
      this.cameraTarget.setOrigin(0.5, 0.5);
      this.camera.startFollow(this.cameraTarget, true, 0.15, 0.15);
    } else {
      this.cameraTarget.x = currentSpawn.x;
      this.cameraTarget.y = currentSpawn.y;
    }
  }

  updateCameraFollow() {
    //this moves the zone whenever pointer is at an edge

    if (!this.input.activePointer) return;
    const pointer = this.input.activePointer;
    let moveX = 0,
      moveY = 0;

    if (pointer.x < this.edgeThreshold) moveX = -this.scrollSpeed;
    else if (pointer.x > GAME_WIDTH - this.edgeThreshold)
      moveX = this.scrollSpeed;

    if (pointer.y < this.edgeThreshold) moveY = -this.scrollSpeed;
    else if (pointer.y > GAME_HEIGHT - this.edgeThreshold)
      moveY = this.scrollSpeed;

    if (moveX || moveY) {
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
    //area loading lol

    const area = areaInfo[index];
    if (!area) return;

    //destroy the old background images
    if (this.backgroundImage) this.backgroundImage.destroy();
    if (this.areaText) this.areaText.destroy();

    //and make current one
    this.backgroundImage = this.add.image(0, 0, "bg" + index).setOrigin(0, 0);
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

    this.objectManager.setArea(area);
  }

  loadPlayerMovement() {
    //ill do this later
    console.log("Player movement here");
  }
}

//area & etc classes

/*
options: 
- create object of (type), with appearance (spriteKey) on (spritePath) in (position)

- spawn in (scene)
- move to (newPosition) with a glide of (duration) ms

- interact 
- interactInspect
- interactUse
- interactTalk

- enable interaction
- disable interaction

- destroy object
*/
class AreaObject {
  constructor(type, spriteKey, spritePath, position) {
    this.type = type;
    this.interactionEnabled = true;
    this.interactionOptions = ["Inspect"];

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

  move(newPosition, duration = 500) {
    if (!(newPosition instanceof Phaser.Math.Vector2)) {
      console.warn("newPosition must be a Phaser.Math.Vector2");
      return;
    }
    this.position = newPosition;

    if (this.sprite && this.scene) {
      this.scene.tweens.add({
        targets: this.sprite,
        x: newPosition.x,
        y: newPosition.y,
        duration: duration,
        ease: "Power2"
      });
    }
  }

  interact() {
    if (!this.interactionEnabled)
      return console.log(`${this.spriteKey} is not interactable`);
    console.log(`Interacting with ${this.spriteKey}`);
  }

  interactInspect() {
    if (!this.interactionEnabled)
      return console.log(`${this.spriteKey} cannot be inspected`);
    console.log(`Inspecting ${this.spriteKey}`);
  }

  interactUse() {
    if (!this.interactionEnabled)
      return console.log(`${this.spriteKey} cannot be used`);
    console.log(`Using ${this.spriteKey}`);
  }

  interactTalk() {
    if (!this.interactionEnabled)
      return console.log(`${this.spriteKey} cannot be talked to`);
    console.log(`Talking to ${this.spriteKey}`);
  }

  enableInteraction() {
    this.interactionEnabled = true;
  }

  disableInteraction() {
    this.interactionEnabled = false;
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}

/*
options:
- create area of (areaName) with (background) holding (objects) with certain (spawnPoints) for player

- add (areaObject) to area
- remmove (areaObject) to area
- clear all objects from area
- get all (areaObject) by its type
- get (areaObject) by its key
*/
class Area {
  constructor(
    areaName = "defaultName",
    background = "defaultBackground.png",
    objects = [],
    spawnPoints = [new Phaser.Math.Vector2(0, 0)]
  ) {
    this.areaName = areaName;
    this.background = background;
    this.objects = objects;
    this.spawnPoints = spawnPoints;
  }

  addObject(areaObject) {
    if (!(areaObject instanceof AreaObject)) {
      console.warn("Can only add instances of AreaObject");
      return;
    }
    this.objects.push(areaObject);
    return areaObject;
  }

  removeObject(areaObject) {
    const index = this.objects.indexOf(areaObject);
    if (index === -1) {
      console.warn("Object not found in this area");
      return;
    }
    this.objects.splice(index, 1);
  }

  clearObjects() {
    this.objects = [];
  }

  getObjectsByType(type) {
    return this.objects.filter((obj) => obj.type === type);
  }

  getObjectByKey(spriteKey) {
    return this.objects.find((obj) => obj.spriteKey === spriteKey);
  }
}

/*
options:
- create Player of (mode) (aka if they're being controlled by player or not)
*/
/*
modes:
- follow - player follows mouse with range of (100)px
- idle - player is idle

- locked - player is not available for movement (ie cutscene)
*/
class Player {
  constructor(mode = "follow") {
    this.mode = mode;
  }
  move() {
    if (this.mode == "follow") console.log("playerMovement active");
  }
  switchMode() {
    console.log("switch mode");
  }
  togglePlayer() {
    if (this.mode == "follow") console.log("toggle player input");
  }
  untogglePlayer() {
    if (this.mode == "follow") console.log("untoggle player input");
  }
}

// area info
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

//global constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const playerInventory = new inventory();

// config
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#2d2d8d",
  parent: "phaser-example",
  scene: [mainScene]
};

const game = new Phaser.Game(config);

//helper functions for keybinding  in scene

//save the keybinding
let KEY_BINDINGS = {};
//register a keybind for the current scene
function registerKey(scene, keyName) {
  if (!KEY_BINDINGS[keyName]) {
    KEY_BINDINGS[keyName] = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[keyName]
    );
  }
  return KEY_BINDINGS[keyName];
}
//Callback for when key is pressed down in scene
function addKeyInput(scene, keyName, callback) {
  registerKey(scene, keyName);
  scene.input.keyboard.on(`keydown-${keyName}`, callback);
}
//Callback for when key is released in scene
function addKeyRelease(scene, keyName, callback) {
  registerKey(scene, keyName);
  scene.input.keyboard.on(`keyup-${keyName}`, callback);
}
//Returns whether key was held dowm in scene
function isKeyDown(scene, keyName) {
  const key = registerKey(scene, keyName);
  return key.isDown;
}
//Returns whether key was just released in scene
function isKeyUp(scene, keyName) {
  const key = registerKey(scene, keyName);
  return Phaser.Input.Keyboard.JustUp(key);
}
