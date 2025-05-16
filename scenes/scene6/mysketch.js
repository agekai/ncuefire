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

let currentPoint;
let pointPath = [];
let pointAddInterval = 10;
let pointAddCounter = 0;

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

  // 初始點在火字群中心（對應你畫fireText的相對位置）
  currentPoint = createVector(100, baseHeight * 0.75);

  // 偵測手機傾斜
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
      orientationX = event.gamma || 0; // 左右傾斜
      orientationY = event.beta || 0;  // 前後傾斜
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

  push();
  translate(100, baseHeight * 0.75);
  drawAxesText();
  drawFireText();
  pop();

  drawRipples();
  drawWalkButton();

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

// 畫框
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

// 畫X,Y軸上的點字（靜態裝飾）
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

// 畫火字群
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

// 畫漣漪特效圓圈
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

// 畫走字按鈕
function drawWalkButton() {
  textSize(32);
  noStroke();
  fill(walkToggle ? color(255, 0, 0) : color(0, 255, 0));
  text("走", walkButtonPos.x, walkButtonPos.y);
}

// 處理觸控事件（切換走字狀態或產生漣漪）
function touchStarted() {
  let scaleFactor = canvasSize / baseWidth;

  for (let t of touches) {
    let tx = t.x / scaleFactor;
    let ty = t.y / scaleFactor;

    if (dist(tx, ty, walkButtonPos.x, walkButtonPos.y) < 30) {
      walkToggle = !walkToggle;
    } else {
      ripples.push({ x: tx, y: ty, radius: 5, alpha: 255 });
    }
  }
  return false;
}

// 按傾斜角度移動點字，速度慢，限制在框與火第一象限範圍內，碰邊界停
function movePointByTilt() {
  let speed = 1.0; // 速度放慢

  // 傾斜角度微調並限制移動速度
  let dx = constrain(orientationX / 10, -1, 1) * speed;
  let dy = constrain(-orientationY / 10, -1, 1) * speed; // y反向(因畫布y向下)

  // 計算下一個位置（canvas座標系）
  let next = createVector(currentPoint.x + dx, currentPoint.y + dy);

  // 限制在「框」邊界內
  let margin = 20; // 距離框字邊界的距離容許值
  if (
    next.x < margin || 
    next.x > baseWidth / 2 - margin || 
    next.y < baseHeight / 2 + margin || // 因fire位置在下半部，故限制y最小為baseHeight/2 + margin
    next.y > baseHeight - margin
  ) {
    // 碰邊界停住
    return;
  }

  // 保持在第一象限（以原點100,baseHeight*0.75為中心向右上方活動）
  // 轉換成相對fire原點座標系(0,0)代表火字群中心
  let relX = next.x - 100;
  let relY = next.y - baseHeight * 0.75;
  if (relX < 0 || relY > 0) {
    return; // 超出第一象限不移動
  }

  // 路徑上點字間距控制，避免重疊(距離需大於18)
  if (pointPath.length === 0 || p5.Vector.dist(next, pointPath[pointPath.length - 1]) > 18) {
    pointPath.push(next.copy());
  }

  currentPoint = next;
}

// 畫走過的點字路徑
function drawPointsPath() {
  fill(255, 200, 200);
  textSize(24);
  noStroke();

  for (let pos of pointPath) {
    text("點", pos.x, pos.y);
  }

  // 畫當前點字位置的圓形脈動特效
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
