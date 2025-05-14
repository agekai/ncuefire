let particles = [];
let dotFlashes = [];
let dotCount = 20;
let radius = 150;

function setup() {
  createCanvas(600, 600);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
	background(0, 40);
	
  // 第一象限的「閃點」
  createDotFlashes();
  updateDotFlashes();
	
  push();
  	translate(100, height * 0.75);
  	drawAxesText(); // 用文字畫軸線
  	drawFireText(); // 用「火」字畫火焰
  pop();
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  let brightColor = color(0, 255, 255);

  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50; // 避免畫到火焰字的區域

  for (let i = -width; i < width; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius-20 && i !== 0) {
      text("點", i, 0);
    }
  }

  for (let j = -height; j < height; j += 20) {
    if (dist(0, j, 0, 0) > exclusionRadius && j !== 0 && j !== -20) {
      text("點", 0, j);
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

    // 增加「風」效果，讓火焰有點飄動感
    let windEffect = sin(frameCount * 0.1 + layer.y * 0.1) * 3;

    textSize(layer.size);
    for (let i = 0; i < layer.count; i++) {
      let wobble = sin(frameCount * 0.1 + i) * 1.5 + windEffect;
      text("火", offsetX + i * spacing + wobble, layer.y);
    }
  }
}

// ---------- 閃現的「點」們 ----------
function createDotFlashes() {
  if (frameCount % 10 === 0) {
    let x = random(width* 0.3, width * 0.8);
    let y = random(30, height * 0.6);
    dotFlashes.push({
      x: x,
      y: y,
      alpha: 255,
      size: 3,
      growth: random(0.2, 0.6)
    });
  }
}

function updateDotFlashes() {
  for (let i = dotFlashes.length - 1; i >= 0; i--) {
    let p = dotFlashes[i];
    textSize(p.size);
    let c = color(255, 255, 255, p.alpha);
    fill(c);
    noStroke();
		text("點", p.x, p.y);
    p.alpha -= 4;
    p.size += p.growth;

    if (p.alpha <= 0) {
      dotFlashes.splice(i, 1);
    }
  }
}

let baseRadius = 120;
let minRadius = 80;
let cycleFrames = 240;
let pauseFrames = 40;

function drawFocus() {
  push();
  let centerX = width * 0.6;
  let centerY = height * 0.35;

  textSize(20);
  fill(180);
  noStroke();

  for (let i = 0; i < dotCount; i++) {
    let baseAngle = TWO_PI / dotCount * i;

    let totalCycle = cycleFrames + pauseFrames;
    let cycle = frameCount % totalCycle;

    let r;
    if (cycle < cycleFrames) {
      let t = cycle / cycleFrames;
      let motion = sin(t * PI);
      r = lerp(baseRadius, minRadius, motion);
    } else {
      r = baseRadius;
    }

    let angle = baseAngle + frameCount * 0.01;

    let x = centerX + cos(angle) * r;
    let y = centerY + sin(angle) * r;

    text("點", x, y);
  }

  let flicker = map(sin(frameCount * 0.1), -1, 1, 80, 200);
  let glowColor = color(random(100, 255), 0, 0, flicker);

  textSize(80);
  stroke(glowColor);
  strokeWeight(3);
  fill(0);
  text("黑", centerX, centerY+5);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
