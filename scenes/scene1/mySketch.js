let canvasW = 600;
let canvasH = 600;
let scaleFactor = 1;
let dotFlashes = [];
let showAxes = false;

function setup() {
  createCanvas(windowWidth, windowHeight); // 螢幕滿版畫布
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
  noFill();
  updateScaleFactor(); // 計算初始縮放
}

function draw() {
  background(0, 40);

  push();
  scale(scaleFactor); // 所有繪圖縮放
  drawFrame();
  createDotFlashes();
  updateDotFlashes();

  push();
  translate(100, canvasH * 0.75);
  if (showAxes) {
    drawAxesText();
  }
  drawFireText();
  pop();

  pop();
}

function drawFrame() {
  fill(0, 200, 255);
  textSize(16);
  let spacing = 20;
  for (let x = 10; x <= canvasW; x += spacing) {
    text("框", x, 10);
    text("框", x, canvasH - 10);
  }
  for (let y = 10; y < canvasH - 10; y += spacing) {
    text("框", 10, y);
    text("框", canvasW - 10, y);
  }
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  textSize(14);
  fill(glowColor);
  noStroke();

  for (let i = -canvasW + 520; i < canvasW - 120; i += 20) {
    if (i !== 0) text("點", i + 10, 0);
  }
  for (let j = -canvasH + 180; j < canvasH - 460; j += 20) {
    if (j !== 0) text("點", 10, j);
  }
}

function drawFireText() {
  let flicker = map(sin(frameCount * 0.1), -1, 0, 100, 255);
  let flameColor = color(255, 100, 0, flicker);
  textSize(16);
  fill(flameColor);
  noStroke();
  text("原", 10, 0);
}

function createDotFlashes() {
  if (frameCount % 10 === 0) {
    let x = random(canvasW * 0.3, canvasW * 0.8);
    let y = random(30, canvasH * 0.6);
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
    let c = color(random(255), random(255), random(255), p.alpha);
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

function mousePressed() {
  // 將滑鼠位置轉為原始比例的 canvas 座標
  let sx = mouseX / scaleFactor;
  let sy = mouseY / scaleFactor;

  let localX = sx - 100;
  let localY = sy - canvasH * 0.75;
  let size = 16;

  if (abs(localX) < size && abs(localY) < size) {
    showAxes = !showAxes;
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateScaleFactor();
}

function updateScaleFactor() {
  let scaleX = windowWidth / canvasW;
  let scaleY = windowHeight / canvasH;
  scaleFactor = min(scaleX, scaleY);
}
