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
let pointAddInterval = 10;
let pointAddCounter = 0;
let currentPoint;

let orientationX = 0;
let orientationY = 0;

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
  currentPoint = createVector(baseWidth / 2, baseHeight * 0.75); // 初始點位於火的位置

  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
      orientationX = event.gamma;
      orientationY = event.beta;
    });
  }
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
      movePointByTilt();
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
  fill(walkToggle ? color(255, 0, 0) : color(0, 255, 0));
  text("走", walkButtonPos.x, walkButtonPos.y);
}

function mousePressed() {
  let d = dist(mouseX * baseWidth / canvasSize, mouseY * baseHeight / canvasSize, walkButtonPos.x, walkButtonPos.y);
  if (d < walkButtonSize) {
    walkToggle = !walkToggle;
  }
}

function movePointByTilt() {
  let speed = 1.5;
  let dx = constrain(orientationX / 10, -1, 1) * speed;
  let dy = constrain(orientationY / 10, -1, 1) * speed;

  let next = createVector(currentPoint.x + dx, currentPoint.y + dy);

  // 限制在第一象限和框內
  if (next.x < 30 || next.x > baseWidth / 2 - 30 || next.y < 30 || next.y > baseHeight / 2 - 30) return;

  if (pointPath.length === 0 || p5.Vector.dist(currentPoint, pointPath[pointPath.length - 1]) > 18) {
    pointPath.push(currentPoint.copy());
  }

  currentPoint = next;
}

function drawPointsPath() {
  for (let i = 0; i < pointPath.length; i++) {
    let pos = pointPath[i].copy();
    fill(255, 200, 200);
    textSize(24);
    text("點", pos.x, pos.y);
  }

  // 畫目前走字位置的圓特效
  if (walkToggle) {
    let pulse = 8 + sin(frameCount * 0.2) * 4;
    stroke(0, 255, 255);
    noFill();
    ellipse(currentPoint.x, currentPoint.y, pulse * 2);
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
