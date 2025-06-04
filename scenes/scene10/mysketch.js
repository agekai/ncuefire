let canvas;
let canvasSize;

let annotationText = "是開始也是結束\n火焰會熄滅 也會再次燃起\n(🔍互動提示：找回最初的點，結束這段旅程!)";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let showAxes = false;
let cleared = false;
let fadingOut = false;
let fadeOpacity = 0;

function setup() {
  let container = document.getElementById('canvas-container');
  canvas = createCanvas(600, 600);
  canvas.parent(container);

  canvas.elt.addEventListener('touchstart', function (e) {
    e.preventDefault();
  }, { passive: false });

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
  if (cleared) return;

  background(0, 40);

  let scaleFactor = canvasSize / 600;
  push();
    scale(scaleFactor);
    drawFrame();
    push();
      translate(100, 600 * 0.75);
      drawAxesText();
      drawFireText();
    pop();
  pop();

  // 漸層黑幕
  if (fadingOut) {
    fadeOpacity += 5;
    fill(0, fadeOpacity);
    rect(0, 0, width, height);

    if (fadeOpacity >= 255) {
      cleared = true;
      showFinalGif();
    }
  }
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
  let flameColor = color(255, 255, 255, flicker);
  textSize(16);
  fill(flameColor);
  noStroke();
  text("🔴", 10, 0);
  text("句", 10, 0);
}

function mousePressed() {
  if (cleared || fadingOut) return;
  if (touches.length === 0) {
    handleAxesToggle(mouseX, mouseY);
  }
}

function touchStarted() {
  if (cleared || fadingOut) return false;
  for (let t of touches) {
    handleAxesToggle(t.x, t.y);
  }
  return false;
}

function handleAxesToggle(x, y) {
  let scaleFactor = canvasSize / 600;
  let localX = x / scaleFactor - 100;
  let localY = y / scaleFactor - 600 * 0.75;
  let size = 16;

  if (abs(localX - 10) < size && abs(localY) < size) {
    annotationElement.textContent = "";
    fadingOut = true; // 啟動淡出流程
  }
}

function typeWriter() {
  if (cleared || fadingOut) return;
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}

function showFinalGif() {
  let gif = document.getElementById("final-gif");
  gif.style.display = "block";
}
