const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

class myScene extends Phaser.Scene {
  constructor() {
    super({ key: "myScene" });
    this.n = 10;
  }

  init() {}

  preload() {}

  create() {
    let pointsList = [];
    let edgeList = [];

    //create a bunch of vertices

    let cols = 5;
    let rows = Math.ceil(this.n / cols);

    let offsetX = (GAME_WIDTH - 200) / cols;
    let offsetY = (GAME_HEIGHT - 200) / (rows - 1);

    //create x/y for points in scene
    for (let i = 0; i < this.n; i++) {
      let col = i % cols;
      let row = Math.floor(i / cols);

      let x = 200 + col * offsetX;
      let y = 100 + row * offsetY;

      let coords = new Phaser.Math.Vector2(x, y);
      pointsList.push(new vertex(coords));
    }

    // place in scene
    for (let v of pointsList) {
      v.place(this);
    }

    //create a bunch of edges
    const edgeNumber = Math.floor(
      Math.random() * (this.n * 4 - this.n) + this.n
    );
    //console.log(edgeNumber)

    for (var i = 0; i < edgeNumber; i++) {
      let randomPointA = Math.floor(Math.random() * pointsList.length);
      //console.log(randomPointA)
      let randomPointB = Math.floor(Math.random() * pointsList.length);
      //console.log(randomPointB)

      function edgeExists(edgeList, a, b) {
        return edgeList.some((edge) => edge.pointA === a && edge.pointB === b);
      }

      //if valid then push to edgelist
      if (
        randomPointA !== randomPointB &&
        !edgeExists(
          edgeList,
          pointsList[randomPointA],
          pointsList[randomPointB]
        )
      ) {
        let myEdge = new edge(
          pointsList[randomPointA],
          pointsList[randomPointB]
        );
        edgeList.push(myEdge);
        pointsList[randomPointA].addToAdjList(myEdge);
        pointsList[randomPointB].addToAdjList(myEdge);
      }
    }

    //place in scene
    for (let edge of edgeList) {
      edge.place(this);
    }

    //run shortest path alg
    const source = pointsList[0];
    const target = pointsList[Math.floor(Math.random() * (pointsList.length-1)) + 1]; //exclude 0

    dijkstra()
    
    function dijkstra() {
      console.log("sd")
      source.setDist(0);
      
      //visual
      source.source();
      target.target();
      
      //these are unvisited
      let unvisitedList = pointsList.slice();
      
      //loop
      //not done
      //while (unvisited.length > 0) {}
      
      
      
    }
    
    
    
    
  }

  update() {}
}

class vertex {
  constructor(coordinates = Phaser.Math.Vector2()) {
    this.coordinates = coordinates;
    this.circle = null;
    
    //alg stuff
    this.visited = false;
    this.prev = null;
    this.distance = Infinity;
    this.adjList = [];
  }

  place(scene) {
    this.circle = scene.add.circle(
      this.coordinates.x,
      this.coordinates.y,
      25,
      0xfafafa
    );
    this.circle.setDepth(1);
  }

  visit() {
    this.visited = true;
    if (this.circle) {
      this.circle.setFillStyle(0xff0000);
      this.circle.setDepth(2);
    }
  }

  unvisit() {
    this.visited = false;
    if (this.circle) {
      this.circle.setFillStyle(0xfafafa);
      this.circle.setDepth(1);
    }
  }

  source() {
    if (this.circle) {
      this.circle.setFillStyle(0x06660e);
      this.circle.setDepth(3);
    }
  }

  target() {
    if (this.circle) {
      this.circle.setFillStyle(0x4263f5);
      this.circle.setDepth(3);
    }
  }

  addToAdjList(edge) {
    this.adjList.push(edge);
  }
  
  setDist(number) {
    this.distance = number;
  }
}

class edge {
  constructor(pointA, pointB, twoway = false) {
    this.pointA = pointA;
    this.pointB = pointB;
    this.twoway = twoway;
    this.line = null;
    this.weight = Math.floor(Math.random() * 20);
    this.text = null;
  }

  place(scene) {
    this.line = scene.add.line(
      0,
      0,
      this.pointA.coordinates.x,
      this.pointA.coordinates.y,
      this.pointB.coordinates.x,
      this.pointB.coordinates.y,
      0xfafafa
    );
    this.line.setOrigin(0, 0);

    const midX = (this.pointA.coordinates.x + this.pointB.coordinates.x) / 2;
    const midY = (this.pointA.coordinates.y + this.pointB.coordinates.y) / 2;

    this.text = scene.add
      .text(midX, midY, this.weight, {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00000055"
      })
      .setOrigin(0.5);
  }

  thisContains(point) {
    return this.pointA === point || this.pointB === point;
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#faf",
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [myScene]
};

const game = new Phaser.Game(config);
