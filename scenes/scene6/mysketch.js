let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第3幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let walkToggle = false; // 走字狀態：false=綠色不走路，true=紅色走路
let walkButtonPos;

let ripples = []; // 儲存點擊產生的圓圈特效

// 新增點字位置與歷史路徑陣列
let dotPos;
let dotHistory = [];
let dotSpacing = 18; // 字間距離，避免重疊
let moveSpeed = 1.2; // 走路速度調整

// 加入裝置傾斜變數
let tiltX = 0;
let tiltY = 0;

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

  // 初始點字位置定在「火」文字原點(100, baseHeight * 0.75)相對座標0,0換算
  // 因為後面有translate(100, baseHeight * 0.75)，所以dotPos初始是(0,0)
  dotPos = createVector(0, 0);

  // 啟用裝置方向事件偵聽
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ 要求使用者授權
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  } else {
    // 非iOS裝置直接綁定
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

function handleOrientation(event) {
  // gamma: 左右傾斜， beta: 前後傾斜
  // 我們用 gamma 當 X， beta 當 Y
  tiltX = event.gamma || 0; // -90 ~ 90，左負右正
  tiltY = event.beta || 0;  // -180 ~ 180，上負下正

  // 為方便，限制 tilt 範圍在 -30 ~ 30 並映射成 -1 ~ 1
  tiltX = constrain(tiltX, -30, 30) / 30;
  tiltY = constrain(tiltY, -30, 30) / 30;
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

  // 更新與繪製點字
  updateDotPosition();
  drawDotPath();

  pop();

  drawRipples();
  drawWalkButton();

  pop();
}

function updateDotPosition() {
  if (walkToggle) {
    // 走路狀態：根據傾斜更新 dotPos
    // 傾斜往右、往下對應 dotPos x+, y+ （因為第一象限且y向下）

    // 移動向量（X方向用tiltX，Y方向用tiltY，Y反向要符合第一象限規則）
    let moveX = tiltX * moveSpeed;
    let moveY = tiltY * moveSpeed;

    // 限制 dotPos 在第一象限與框內
    // 框的邊界約為 x:0~(baseWidth - 120 - 100)，y:0~(baseHeight - 460 - baseHeight*0.75)
    // 這邊先計算框的第一象限邊界：
    let minX = 0;
    let minY = -baseHeight * 0.75; // 因為translate移動，dotPos原點相對底部有負Y
    let maxX = baseWidth - 120 - 100; // 600-120-100=380
    let maxY = 0; // Y軸0在translate之後點字最高點

    // dotPos.y 會往上移動是負值減少，往下移動是正值增加，但範圍限定於 minY 到 maxY
    let newX = dotPos.x + moveX;
    let newY = dotPos.y + moveY;

    // 限制不要超出邊界
    newX = constrain(newX, minX, maxX);
    newY = constrain(newY, minY, maxY);

    // 只有當移動後距離足夠遠才加入新點，避免字重疊
    if (p5.Vector.dist(createVector(newX, newY), dotPos) >= dotSpacing) {
      dotPos.set(newX, newY);
      // 新增新的點字位置到歷史路徑
      dotHistory.push(dotPos.copy());
    }
  }
}

function drawDotPath() {
  fill(walkToggle ? color(255, 0, 0) : color(0, 255, 0));
  noStroke();
  textSize(16);

  if (!walkToggle) {
    // 不走路時，用弦波震盪走過的點字路徑
    let waveAmplitude = 5;
    let waveFrequency = 0.1;

    for (let i = 0; i < dotHistory.length; i++) {
      let pos = dotHistory[i].copy();
      // Y 方向做弦波震盪
      pos.y += sin(frameCount * waveFrequency + i * 0.5) * waveAmplitude;

      text(".", pos.x, pos.y);
    }
  } else {
    // 走路時正常畫出路徑點
    for (let pos of dotHistory) {
      text(".", pos.x, pos.y);
    }
    // 畫出當前移動點，讓使用者看到動態感
    text(".", dotPos.x, dotPos.y);
  }
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

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
