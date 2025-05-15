let canvas;
let canvasSize; // 動態計算的尺寸

let dotFlashes = [];
let showAxes = false;

let annotationText = "這是第1幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50; // ms per char

function setup() {
  let container = document.getElementById('canvas-container');
  canvas = createCanvas(600, 600);
  canvas.parent(container);

  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
  noFill();

  annotationElement = document.getElementById('annotation');
  annotationElement.textContent = "";
  annotationIndex = 0;
  setTimeout(typeWriter, annotationSpeed);

  adjustCanvasSize();
  window.addEventListener('resize', adjustCanvasSize);
}

function adjustCanvasSize() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth;
  let h = container.clientHeight;
  canvasSize = Math.min(w, h);
  resizeCanvas(canvasSize, canvasSize);
}

function draw() {
  background(0, 40);

  // 用比例縮放內容，保持動畫設計的600x600比例
  let scaleFactor = canvasSize / 600;
  push();
  scale(scaleFactor);

  drawFrame();

  createDotFlashes();
  updateDotFlashes();

  push();
  translate(100, 600 * 0.75);
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
  for (let x = 10; x <= 600; x += spacing) {
    text("框", x, 10);
    text("框", x, 600 - 10);
  }
  for (let y = 10; y < 600 - 10; y += spacing) {
    text("框", 10, y);
    text("框", 600 - 10, y);
  }
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  textSize(14);
  fill(glowColor);
  noStroke();

  for (let i = -600 + 520; i < 600 - 120; i += 20) {
    if (i !== 0) text("點", i + 10, 0);
  }
  for (let j = -600 + 180; j < 600 - 460; j += 20) {
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
    let x = random(600 * 0.3, 600 * 0.8);
    let y = random(30, 600 * 0.6);
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
  let localX = mouseX / (canvasSize / 600) - 100;
  let localY = mouseY / (canvasSize / 600) - 600 * 0.75;
  let size = 16;

  if (abs(localX) < size && abs(localY) < size) {
    showAxes = !showAxes;
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}