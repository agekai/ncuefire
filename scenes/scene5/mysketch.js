let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第5幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let dotCommaLines = [
  " 	點點點",
  " 點點點點點",
  " 點點點點點",
  "    點點點點",
  "            點",
  "          點",
  "        點"
];

// 跳舞的「逗」位置
let dancingDots = [
  [0, 2], [0, 4], [2, 1], [2, 5], [3, 4], [3, 5], [3, 6],
];

// 拖曳用物件管理三個字
let draggableNumbers = [
  { char: "4", x: baseWidth * 0.75, y: baseHeight * 0.85, col: null, dancing: false },
  { char: "5", x: baseWidth * 0.85, y: baseHeight * 0.85, col: null, dancing: false },
  { char: "3", x: baseWidth * 0.65, y: baseHeight * 0.85, col: null, dancing: false },
];

let draggingIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isDouDancing = false;

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

  draggableNumbers[0].col = color(255, 100, 100);
  draggableNumbers[1].col = color(100, 255, 100);
  draggableNumbers[2].col = color(100, 100, 255);

  canvas.mousePressed(startDragging);
  canvas.mouseReleased(stopDragging);
  canvas.touchStarted(startDragging);
  canvas.touchEnded(stopDragging);
  canvas.touchMoved(touchDragging);
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
  drawDotArt();
  pop();

  push();
  translate(100, baseHeight * 0.75);
  drawAxesText();
  drawFireText();
  pop();

  updateDragging();
  drawDraggableNumbers();

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

function drawDotArt() {
  let startX = baseWidth * 0.45;
  let startY = baseHeight * 0.15;
  let lineHeight = 35;

  textSize(32);
  textAlign(LEFT, TOP);
  noStroke();

  for (let i = 0; i < dotCommaLines.length; i++) {
    let y = startY + i * lineHeight;
    let x = startX;

    for (let j = 0; j < dotCommaLines[i].length; j++) {
      let char = dotCommaLines[i][j];
      let isDancingDot = dancingDots.some(([row, col]) => row === i && col === j);

      if (char == "點") {
        if (isDouDancing && isDancingDot) {
          let flicker = map(sin(frameCount * 0.2 + i + j), -1, 1, 100, 255);
          fill(color(255, 255, 0, flicker));
          let bounce = sin(frameCount * 0.3 + i + j) * 1;
          text("逗", x, y + bounce);
        } else {
          fill(255);
          text(char, x, y);
        }
      } else if (char == "逗") {
        fill(255);
        text(char, x, y);
      }

      if (char !== "\t") {
        x += textWidth(char);
      } else {
        x += textWidth("　");
      }
    }
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}

function startDragging() {
  let scaleFactor = canvasSize / baseWidth;
  let mx = (touches.length > 0 ? touches[0].x : mouseX) / scaleFactor;
  let my = (touches.length > 0 ? touches[0].y : mouseY) / scaleFactor;

  for (let i = 0; i < draggableNumbers.length; i++) {
    let d = dist(mx, my, draggableNumbers[i].x, draggableNumbers[i].y);
    if (d < 20) {
      draggingIndex = i;
      dragOffsetX = draggableNumbers[i].x - mx;
      dragOffsetY = draggableNumbers[i].y - my;
      return false;
    }
  }
}

function stopDragging() {
  draggingIndex = -1;
}

function updateDragging() {
  if (draggingIndex !== -1 && touches.length === 0) {
    let scaleFactor = canvasSize / baseWidth;
    let mx = mouseX / scaleFactor;
    let my = mouseY / scaleFactor;

    draggableNumbers[draggingIndex].x = constrain(mx + dragOffsetX, 0, baseWidth);
    draggableNumbers[draggingIndex].y = constrain(my + dragOffsetY, 0, baseHeight);
  }

  let allInFirstQuadrant = true;
  for (let num of draggableNumbers) {
    num.dancing = (num.x > baseWidth * 0.2 && num.y < baseHeight * 0.72);
    if (!num.dancing) allInFirstQuadrant = false;
  }

  isDouDancing = allInFirstQuadrant;
}

function drawDraggableNumbers() {
  textSize(32);
  textAlign(CENTER, CENTER);
  noStroke();

  for (let num of draggableNumbers) {
    if (num.dancing) {
      let bounce = sin(frameCount * 0.3 + num.char.charCodeAt(0)) * 5;
      fill(255, 255, 0);
      text(num.char, num.x, num.y + bounce);
    } else {
      fill(num.col);
      text(num.char, num.x, num.y);
    }
  }
}

function touchDragging() {
  if (touches.length > 0 && draggingIndex !== -1) {
    let scaleFactor = canvasSize / baseWidth;
    let tx = touches[0].x / scaleFactor;
    let ty = touches[0].y / scaleFactor;

    draggableNumbers[draggingIndex].x = constrain(tx + dragOffsetX, 0, baseWidth);
    draggableNumbers[draggingIndex].y = constrain(ty + dragOffsetY, 0, baseHeight);
  }
  return false; // 防止頁面滑動
}
