let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第3幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

function setup() {
  let container = document.getElementById('canvas-container');
  canvas = createCanvas(baseWidth, baseHeight);
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

  let scaleFactor = canvasSize / baseWidth;
  push();
  scale(scaleFactor);

  drawFrame();

  push();
  translate(100, baseHeight * 0.75); // 使用邏輯高度600
  drawAxesText();
  drawFireText();
  pop();

  drawTouchPoints();
  pop();
}

function drawFrame() {
  fill(0, 200, 255);
  textSize(16);
  let spacing = 20;
  for (let x = 10; x <= baseWidth; x += spacing) {
    text("框", x, 10);
    text("框", x, baseHeight - 10);
  }
  for (let y = 10; y < baseHeight - 10; y += spacing) {
    text("框", 10, y);
    text("框", baseWidth - 10, y);
  }
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);

  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50;

  for (let i = -80; i < 480; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點", i + 10, 0);
    }
  }

  for (let j = -420; j < 140; j += 20) {
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

let firstTouch = null;
let secondTouch = null;
let lineProgress = 0;
let maxLineChars = 0;

function drawTouchPoints() {
  textSize(32);
  noStroke();
  fill(255);

  let scaleFactor = canvasSize / baseWidth;

  if (touches.length === 1) {
    let t = touches[0];
    let x = t.x / scaleFactor;
    let y = t.y / scaleFactor;

    firstTouch = createVector(x, y);
    secondTouch = null;
    lineProgress = 0;
    text("點", x, y);
  } 
  else if (touches.length === 2) {
    if (firstTouch === null) {
      let x0 = touches[0].x / scaleFactor;
      let y0 = touches[0].y / scaleFactor;
      firstTouch = createVector(x0, y0);
    }

    let x1 = touches[1].x / scaleFactor;
    let y1 = touches[1].y / scaleFactor;
    secondTouch = createVector(x1, y1);

    text("點", firstTouch.x, firstTouch.y);
    text("點", secondTouch.x, secondTouch.y);

    drawLineAnimation(firstTouch, secondTouch);
  } 
  else {
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

  if (lineProgress < maxLineChars) {
    lineProgress += 0.5;
  }

  for (let i = 1; i < int(lineProgress); i++) {
    let pos = p5.Vector.add(p1, p5.Vector.mult(direction, i));

    let flicker = map(sin(frameCount * 0.1 + i), -1, 1, 150, 255);
    let r = 255;
    let g = map(i, 0, maxLineChars, 100, 200);
    let b = 0;

    fill(r, g, b, flicker);

    let wobbleX = sin(frameCount * 0.1 + i * 0.5) * 2;
    let wobbleY = cos(frameCount * 0.1 + i * 0.3) * 2;

    push();
    translate(pos.x + wobbleX, pos.y + wobbleY);
    rotate(sin(frameCount * 0.05 + i) * 0.1);
    textSize(24 + sin(frameCount * 0.2 + i) * 2);
    text("線", 0, 0);
    pop();
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
