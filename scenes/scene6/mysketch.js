let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第3幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let walkToggle = false;
let walkButtonPos;
let walkButtonSize = 40;
let pointPath = [];
let pointAddInterval = 60;
let pointAddCounter = 0;

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

  walkButtonPos = createVector(baseWidth * 0.85, baseHeight * 0.85);
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
  drawWalkToggle();

  if (walkToggle) {
    pointAddCounter++;
    if (pointAddCounter >= pointAddInterval) {
      addNewPoint();
      pointAddCounter = 0;
    }
  }
  drawPointsPath();
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

function drawWalkToggle() {
  textSize(walkButtonSize);
  fill(255);
  text("走", walkButtonPos.x, walkButtonPos.y);
}

function mousePressed() {
  let d = dist(mouseX * baseWidth / canvasSize, mouseY * baseHeight / canvasSize, walkButtonPos.x, walkButtonPos.y);
  if (d < walkButtonSize) {
    walkToggle = !walkToggle;
  }
}

function addNewPoint() {
  let x = random(30, baseWidth / 2 - 30);
  let y = random(30, baseHeight / 2 - 30);
  pointPath.push(createVector(x, y));
}

function drawPointsPath() {
  for (let i = 0; i < pointPath.length; i++) {
    let pos = pointPath[i].copy();
    let flicker = map(sin(frameCount * 0.05 + i), -1, 1, -10, 10);
    if (walkToggle) {
      pos.x += sin(frameCount * 0.1 + i) * 10;
    }

    fill(255, 200, 200);
    textSize(24);
    text("點", pos.x + flicker, pos.y);
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
