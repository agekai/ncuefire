let touchesPos = [];

function setup() { 
  createCanvas(600, 600);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
  background(0, 40);

  push();
  translate(100, height * 0.75);
  drawAxesText();
  drawFireText();
  pop();

  drawTouchPoints();
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);

  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50;

  for (let i = -width; i < width; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("線", i, 0);
    }
  }

  for (let j = -height; j < height; j += 20) {
    if (dist(0, j, 0, 0) > exclusionRadius && j !== 0 && j !== -20) {
      text("線", 0, j);
    }
  }
}

function drawFireText() {
  let flicker = map(sin(frameCount * 0.03), -1, 1, 100, 255);
  fill(255, 100 + random(20), 0, flicker);
  noStroke();

  let layers = [
    { count: 2, y: 45, size: 16 },
    { count: 3, y: 30, size: 18 },
    { count: 4, y: 15, size: 22 },
    { count: 3, y: 0, size: 24 },
    { count: 2, y: -15, size: 26 },
    { count: 1, y: -35, size: 28 },
  ];

  for (let layer of layers) {
    let spacing = 18;
    let offsetX = -(layer.count - 1) * spacing / 2;
    let windEffect = sin(frameCount * 0.1 + layer.y * 0.1) * 3;

    textSize(layer.size);
    for (let i = 0; i < layer.count; i++) {
      let wobble = sin(frameCount * 0.1 + i) * 1.5 + windEffect;
      text("火", offsetX + i * spacing + wobble, layer.y);
    }
  }
}

let firstTouch = null;
let secondTouch = null;
let lineProgress = 0;
let maxLineChars = 0;

function drawTouchPoints() {
  textSize(32);
  noStroke();
  fill(255);

  // 當畫面有觸控點時
  if (touches.length === 1) {
    let t = touches[0];
    firstTouch = createVector(t.x, t.y);
    secondTouch = null;
    lineProgress = 0;
    text("點", t.x, t.y);
  } 
  else if (touches.length === 2) {
    if (firstTouch === null) {
      firstTouch = createVector(touches[0].x, touches[0].y);
    }

    secondTouch = createVector(touches[1].x, touches[1].y);
    text("點", firstTouch.x, firstTouch.y);
    text("點", secondTouch.x, secondTouch.y);

    drawLineAnimation(firstTouch, secondTouch);
  } 
  else {
    // 沒有或超過兩指：重置所有
    firstTouch = null;
    secondTouch = null;
    lineProgress = 0;
  }
}

function drawLineAnimation(p1, p2) {
  let spacing = 30;
  let totalDist = p1.dist(p2);
  let direction = p5.Vector.sub(p2, p1).normalize().mult(spacing);

  maxLineChars = int(totalDist / spacing);

  // 緩慢遞增線段數
  if (lineProgress < maxLineChars) {
    lineProgress += 0.5;
  }

  for (let i = 1; i < int(lineProgress); i++) {
    let pos = p5.Vector.add(p1, p5.Vector.mult(direction, i));

    // 火苗的顏色閃爍
    let flicker = map(sin(frameCount * 0.1 + i), -1, 1, 150, 255);
    let r = 255;
    let g = map(i, 0, maxLineChars, 100, 200);
    let b = 0;

    fill(r, g, b, flicker);

    // 火苗跳動感
    let wobbleX = sin(frameCount * 0.1 + i * 0.5) * 2;
    let wobbleY = cos(frameCount * 0.1 + i * 0.3) * 2;

    push();
    translate(pos.x + wobbleX, pos.y + wobbleY);
    rotate(sin(frameCount * 0.05 + i) * 0.1);
    textSize(24 + sin(frameCount * 0.2 + i) * 2); // 呼吸感
    text("線", 0, 0);
    pop();
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
