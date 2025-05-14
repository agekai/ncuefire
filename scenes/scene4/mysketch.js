function setup() {
  createCanvas(600, 600);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
  //background(0, 40);
  background(0);
	drawFrame();
	
	push();
  	drawFocus();
	pop();

  push();
  	translate(100, height * 0.75);
  	//scale(1, -1);
  	drawAxesText(); // 用文字畫軸線
  	drawFireText(); // 用「火」字畫火焰
  pop();
}

function drawFrame() {
  fill(0, 200, 255);
  textSize(16);
  let spacing = 20;
  for (let x = 10; x <= width; x += spacing) {
    text("框", x, 10);
    text("框", x, height - 10);
  }
  for (let y = 10; y < height - 10; y += spacing) {
    text("框", 10, y);
    text("框", width - 10, y);
  }
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  let brightColor = color(0, 255, 255);

  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50; // 避免畫到火焰字的區域

  for (let i = -width + 520; i < width - 120; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點", i + 10, 0);
    }
  }

  for (let j = -height + 180; j < height - 460; j += 20) {
    if (dist(0, j, 0, 0) > exclusionRadius && j !== 0 && j !== -20) {
      text("點", 10, j);
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
    let offsetX = -(layer.count - 2) * spacing / 2;

    // 增加「風」效果，讓火焰有點飄動感
    let windEffect = sin(frameCount * 0.1 + layer.y * 0.1) * 3;

    textSize(layer.size);
    for (let i = 0; i < layer.count; i++) {
      let wobble = sin(frameCount * 0.1 + i) * 1.5 + windEffect;
      text("火", offsetX + i * spacing + wobble, layer.y);
    }
  }
}

let baseRadius = 120;
let minRadius = 80;
let cycleFrames = 240;
let pauseFrames = 40;
let dotCount = 20;

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
