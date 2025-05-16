let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第3幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

// 路徑與位置控制
let pathPoints = [];
let currentPos;
let walkStarted = false;

// iOS方向感應授權按鈕
let permissionGranted = false;
let permissionButton;

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

  currentPos = createVector(baseWidth / 2, baseHeight / 2);

  // iOS授權判斷
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    noLoop(); // 等授權完成才執行draw

    permissionButton = createButton('允許方向感應');
    permissionButton.parent(container);
    permissionButton.style('font-size', '20px');
    permissionButton.style('padding', '10px 20px');
    permissionButton.position(container.clientWidth/2 - 80, container.clientHeight/2 - 20);
    permissionButton.mousePressed(requestOrientationPermission);
  } else {
    permissionGranted = true;
  }
}

function requestOrientationPermission() {
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        permissionGranted = true;
        permissionButton.remove();
        loop();
      } else {
        alert('需要允許方向感應才能使用此功能');
      }
    })
    .catch(console.error);
}

function adjustCanvasSize() {
  let container = document.getElementById('canvas-container');
  let w = container.clientWidth;
  let h = container.clientHeight;
  canvasSize = Math.min(w, h);
  resizeCanvas(canvasSize, canvasSize);
}

function draw() {
  if (!permissionGranted) {
    background(30);
    fill(255);
    textSize(18);
    text('請點擊「允許方向感應」按鈕', width / 2, height / 2 - 40);
    return;
  }

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

function drawTouchPoints() {
  textSize(32);
  noStroke();

  let scaleFactor = canvasSize / baseWidth;

  // 控制走路移動速度(左右前後傾斜)
  let speedX = map(rotationY, -30, 30, -2, 2, true);
  let speedY = map(rotationX, -30, 30, -2, 2, true);

  if (!walkStarted) {
    fill(0, 255, 0);
    text("走", currentPos.x, currentPos.y);
    if (touches.length > 0) walkStarted = true;
  } else {
    currentPos.x += speedX;
    currentPos.y += speedY;

    currentPos.x = constrain(currentPos.x, 0, baseWidth);
    currentPos.y = constrain(currentPos.y, 0, baseHeight);

    if (pathPoints.length === 0 || p5.Vector.dist(currentPos, pathPoints[pathPoints.length - 1]) > 5) {
      pathPoints.push(currentPos.copy());
    }

    // 靜態綠色點路徑（未走過）
    fill(0, 255, 0);
    for (let p of pathPoints) {
      text("點", p.x, p.y);
    }

    // 動態紅色震盪點路徑（已走過）
    fill(255, 0, 0);
    for (let i = 0; i < pathPoints.length; i++) {
      let p = pathPoints[i];
      let wobbleX = sin(frameCount * 0.1 + i) * 3;
      let wobbleY = cos(frameCount * 0.1 + i) * 3;
      push();
      translate(p.x + wobbleX, p.y + wobbleY);
      text("點", 0, 0);
      pop();
    }

    // 當前位置大紅走字
    fill(255, 0, 0);
    textSize(36);
    text("走", currentPos.x, currentPos.y);
    textSize(32);
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
