let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第2幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let dotFlashes = [];
let isActive = false; // 動畫狀態：false = 靜態, true = 動態

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

  if (isActive) {
    // 動態模式
    push();
    createDotFlashes();
    updateDotFlashes();
    pop();

    push();
    translate(100, baseHeight * 0.75); // 使用邏輯高度600
    drawAxesText();
    drawFireText();
    pop();
  } else {
    // 靜態模式
    push();
    translate(100, baseHeight * 0.75); // 使用邏輯高度600
    drawSingleFireAtOrigin(); // 在原點顯示一個「火」
    drawAxesText(); // 軸線仍存在
    pop();
  }
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

  for (let i = -baseWidth + 520; i < baseWidth - 120; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點,", i + 10, 0);
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

function createDotFlashes() {
  if (frameCount % 10 === 0) {
    let x = random(baseWidth * 0.3, baseWidth * 0.8);
    let y = random(30, baseHeight * 0.6);
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
  // 換算點擊位置為邏輯座標
  let scaleFactor = canvasSize / baseWidth;
  let scaledMouseX = mouseX / scaleFactor;
  let scaledMouseY = mouseY / scaleFactor;

  // 原點位置
  let originX = 100;
  let originY = baseHeight * 0.75;

  // 判斷點擊是否落在火字上
  let d = dist(scaledMouseX, scaledMouseY, originX + 10, originY + 15); // +10 是 drawSingleFireAtOrigin() 中的偏移量
  if (d < 20) {
    isActive = !isActive;
  }
}


function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}