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
      Math.random() * (this.n * 2 - this.n) + this.n
    );
    //console.log(edgeNumber)

    for (var i = 0; i < edgeNumber; i++) {
      let randomPointA = Math.floor(Math.random() * pointsList.length);
      //console.log(randomPointA)
      let randomPointB = Math.floor(Math.random() * pointsList.length);
      //console.log(randomPointB)

      function edgeExists(edgeList, a, b) {
        return edgeList.some(
          (edge) =>
            (edge.pointA === a && edge.pointB === b) ||
            (edge.pointA === b && edge.pointB === a)
        );
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
    const target =
      pointsList[Math.floor(Math.random() * (pointsList.length - 1)) + 1]; //exclude 0

    dijkstra();

    function dijkstra() {
      console.log("sd");
      source.setDist(0);

      //visual
      source.source();
      target.target();

      //these are unvisited
      let unvisitedList = pointsList.slice();

      //loop while there are still vertices to look
      while (unvisitedList.length > 0) {
        let minIndex = 0;
        for (let i = 1; i < unvisitedList.length; i++) {
          if (unvisitedList[i].distance < unvisitedList[minIndex].distance)
            minIndex = i;
        }

        //remove the min distance
        let u = unvisitedList.splice(minIndex, 1)[0];

        if (u.distance === Infinity) break;
        if (u !== source && u !== target) u.visit();
        if (u === target) break;

        for (let e of u.adjList) {
          
          //v is the other endpoint
          let v = e.pointA === u ? e.pointB : e.pointA;
          //calc new distance
          let alt = u.distance + e.weight;
          //if smaller than current distance
          if (alt < v.distance) {
            v.distance = alt;
            v.prev = u;
          }
        }
      }

      let path = [];
      let u = target;

      while (u) {
        path.push(u);
        if (u !== source && u !== target) {
          u.select();
        }
        u = u.prev;
      }
      path.reverse();

      for (let i = 0; i < path.length - 1; i++) {
        let a = path[i];
        let b = path[i + 1];
        let e = a.adjList.find(
          (edge) =>
            (edge.pointA === a && edge.pointB === b) ||
            (edge.pointA === b && edge.pointB === a)
        );
        if (e) {
          e.line.setStrokeStyle(4, 0xffff00); 
        }
      }
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
      this.circle.setFillStyle(0xffe3fb);
      this.circle.setDepth(2);
    }
  }

  unvisit() {
    this.visited = false;
    if (this.circle) {
      this.circle.setFillStyle(0xffffff);
      this.circle.setDepth(1);
    }
  }

  select() {
    if (this.circle) {
      this.circle.setFillStyle(0xff00ff);
      this.circle.setDepth(2);
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
