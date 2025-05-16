let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第3幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let walkToggle = false; // 走字狀態：false=綠色，true=紅色
let walkButtonPos;

let ripples = []; // 儲存點擊產生的圓圈特效
let touchHandled = false;

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

  push();
  translate(100, baseHeight * 0.75);
  drawAxesText();
  drawFireText();
  pop();

  drawRipples();
  drawWalkButton();

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

// 畫出點擊後的漣漪圓圈
function drawRipples() {
  noFill();
  stroke(0, 255, 255);
  strokeWeight(1);

  for (let i = ripples.length - 1; i >= 0; i--) {
    let ripple = ripples[i];
    stroke(0, 255, 255, ripple.alpha);
    ellipse(ripple.x, ripple.y, ripple.radius * 2);
    ripple.radius += 1;
    ripple.alpha -= 3;
    if (ripple.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

// 顯示走字按鈕
function drawWalkButton() {
  textSize(32);
  noStroke();
  fill(walkToggle ? color(255, 0, 0) : color(0, 255, 0));
  text("走", walkButtonPos.x, walkButtonPos.y);
}

// 處理觸控事件
let inputCooldown = false;

function handleInput(x, y) {
  let scaleFactor = canvasSize / baseWidth;
  let px = x / scaleFactor;
  let py = y / scaleFactor;

  if (dist(px, py, walkButtonPos.x, walkButtonPos.y) < 30) {
    walkToggle = !walkToggle;
  } else {
    ripples.push({ x: px, y: py, radius: 5, alpha: 255 });
  }
}

// 滑鼠點擊
function mousePressed() {
  if (!inputCooldown) {
    handleInput(mouseX, mouseY);
    inputCooldown = true;
    setTimeout(() => inputCooldown = false, 100); // 簡單冷卻時間防多次觸發
  }
}

// 觸控點擊
function touchStarted() {
  if (!inputCooldown) {
    for (let t of touches) {
      handleInput(t.x, t.y);
    }
    inputCooldown = true;
    setTimeout(() => inputCooldown = false, 100);
  }
}


function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
