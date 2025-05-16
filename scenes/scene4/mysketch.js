let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第4幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let blackX, blackY;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

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

  blackX = baseWidth * 0.6;
  blackY = baseHeight * 0.35;
}

function adjustCanvasSize() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth;
  let h = container.clientHeight;
  canvasSize = Math.min(w, h);
  resizeCanvas(canvasSize, canvasSize);
}

function draw() {
  background(0);

  let scaleFactor = canvasSize / baseWidth;
  push();
  scale(scaleFactor);

  drawFrame();

  push();
  drawFocus();
  pop();

  push();
  translate(100, baseHeight * 0.75);
  drawAxesText();
  drawFireText();
  pop();

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

  for (let i = -baseWidth + 520; i < baseWidth - 120; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點", i + 10, 0);
    }
  }

  for (let j = -baseHeight + 180; j < baseHeight - 460; j += 20) {
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

let baseRadius = 120;
let minRadius = 80;
let cycleFrames = 240;
let pauseFrames = 40;
let dotCount = 20;

function drawFocus() {
  push();
  let centerX = blackX;
  let centerY = blackY;

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
  text("黑", centerX, centerY + 5);
  pop();
}

function mousePressed() {
  let scaleFactor = canvasSize / baseWidth;
  let d = dist(mouseX, mouseY, blackX * scaleFactor, blackY * scaleFactor);
  if (d < 60) {
    dragging = true;
    dragOffsetX = mouseX - blackX * scaleFactor;
    dragOffsetY = mouseY - blackY * scaleFactor;
  }
}

function mouseDragged() {
  if (dragging) {
    let scaleFactor = canvasSize / baseWidth;
    let newX = (mouseX - dragOffsetX) / scaleFactor;
    let newY = (mouseY - dragOffsetY) / scaleFactor;

    // 限制在「框」內（上下左右都保留邊界 10px）
    let margin = 10;
    blackX = constrain(newX, margin, baseWidth - margin);
    blackY = constrain(newY, margin, baseHeight - margin);
  }
}

function mouseReleased() {
  dragging = false;
}

function touchStarted() {
  mousePressed();
  return false;
}
function touchMoved() {
  mouseDragged();
  return false;
}
function touchEnded() {
  mouseReleased();
  return false;
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}