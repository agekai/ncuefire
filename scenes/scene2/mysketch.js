let dotFlashes = [];
let isActive = false; // 動畫狀態：false = 靜態, true = 動態

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
  background(0, 40);
  drawFrame();

  if (isActive) {
    // 動態模式
    push();
    createDotFlashes();
    updateDotFlashes();
    pop();

    push();
    translate(100, height * 0.75);
    drawAxesText();
    drawFireText();
    pop();
  } else {
    // 靜態模式
    push();
    translate(100, height * 0.75);
    drawSingleFireAtOrigin(); // 在原點顯示一個「火」
    drawAxesText(); // 軸線仍存在
    pop();
  }
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

function drawSingleFireAtOrigin() {
	let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(255, 100, 0, flicker);
	noStroke();
  fill(glowColor);
  textSize(60);
  text("火", 10, 0);
	
  textSize(20);
  fill(255,0,0);
	text("▲", 10, 35);
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50;

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
    let windEffect = sin(frameCount * 0.1 + layer.y * 0.1) * 3;
    textSize(layer.size);
    for (let i = 0; i < layer.count; i++) {
      let wobble = sin(frameCount * 0.1 + i) * 1.5 + windEffect;
      text("火", offsetX + i * spacing + wobble, layer.y);
    }
  }
}

function createDotFlashes() {
  if (frameCount % 10 === 0) {
    let x = random(width * 0.3, width * 0.8);
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
    let c = color(255, 100 + random(20), 0, p.alpha);
    fill(c);
    noStroke();
    text("火", p.x, p.y);
    p.alpha -= 4;
    p.size += p.growth;

    if (p.alpha <= 0) {
      dotFlashes.splice(i, 1);
    }
  }
}

function mousePressed() {
  // 將點擊位置轉換為原點座標系 (畫布中心偏移)
  let originX = 100;
  let originY = height * 0.75;
  let d = dist(mouseX, mouseY, originX, originY);

  if (d < 20) {
    isActive = !isActive;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
