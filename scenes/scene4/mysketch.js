let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第4幕的文字註解，用打字機效果逐字出現。\n🔍互動提示：換個地方，也許都一樣";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let blackX, blackY;
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// 新增「占」字位置 (固定)
let occupyX = baseWidth * 0.75;
let occupyY = baseHeight * 0.87;

let isFocusActive = true; // 控制是否焦點動畫播放(黑字是否閃爍旋轉)

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

  // 判斷「黑」字是否靠近「占」字左側一定範圍內
  // 判斷條件：黑字x座標在占字左側50px內，且y軸距離不超過50px
  let nearThresholdX = 85;
  let nearThresholdY = 20;
  let nearOccupy = false;
  if (
    blackX > occupyX - nearThresholdX &&
    blackX < occupyX &&
    abs(blackY - occupyY) < nearThresholdY
  ) {
    nearOccupy = true;
  }

  if (nearOccupy) {
    // 黑字停止焦點動畫，變成靜止狀態
    isFocusActive = false;
  } else {
    // 否則保持焦點動畫
    isFocusActive = true;
  }

  // 畫「占」字（固定位置）
  drawOccupy();

  push();
  drawFocus(isFocusActive);
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

// drawFocus 現在接收一個布林值參數，控制是否顯示焦點動畫
function drawFocus(active) {
  push();
  let centerX = blackX;
  let centerY = blackY;

  if (active) {
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
  } else {
    // 靜止模式，畫黑字但不閃爍不動
    textSize(80);
    noStroke();
    fill(150);
    text("黑", centerX, centerY + 5);

    // 旁邊排成點字的「占」
    textSize(20);
    fill(180);
    noStroke();

    // 「占」字左側排列點字（靜止不動）
    let dotSpacing = 20;
    let dotCountStatic = 8;
    for (let i = 0; i < dotCountStatic; i++) {
      let x = centerX - 40 - i * dotSpacing;
      let y = centerY;
      text("點", x, y);
    }

    // 靜態「占」字本體
    textSize(80);
    fill(150);
    text("占", occupyX, occupyY + 5);
  }
  pop();
}

function drawOccupy() {
  // 畫固定位置的「占」字
  textSize(80);
  fill(255);
  noStroke();
  text("占", occupyX, occupyY + 5);
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

// 文字逐字打字機效果
function typeWriter() {
if (annotationIndex < annotationText.length) {
annotationElement.textContent += annotationText.charAt(annotationIndex);
annotationIndex++;
setTimeout(typeWriter, annotationSpeed);
}
}