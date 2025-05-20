let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第7幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let ripples = []; // 儲存點擊產生的圓圈特效
let touchHandled = false;

let dots = [];  // 新增：點字物件陣列
let numDots = 50;
let heartPos;  // 右下角❤的位置
let heartSize = 40;

let arrangingHeart = false;  // 控制是否排列成心型

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

  // 初始化點字陣列，在第一象限範圍（x: baseWidth/2~baseWidth, y: 0~baseHeight/2）
  for (let i = 0; i < numDots; i++) {
    dots.push({
      pos: createVector(random(baseWidth*0.22, baseWidth-25), random(25, baseHeight*0.73)),
      vel: p5.Vector.random2D().mult(0.5),
      target: null // 用於心型排列的目標位置
    });
  }

  // ❤固定在右下角
  heartPos = createVector(baseWidth * 0.8, baseHeight * 0.86);
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

  drawFloatingDots();

  drawHeart();

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

// 畫出漂浮或排列成心型的點字
function drawFloatingDots() {
  textSize(14);
  if (arrangingHeart) {
    fill(255, 105, 180); // 粉紅色
  } else {
    fill(0, 255, 255);   // 原本的青色
  }
  noStroke();

  for (let d of dots) {
    if (arrangingHeart) {
      // 心型排列模式：點字緩慢往目標心型點移動
      if (!d.target) continue; // 防止出錯

      let dir = p5.Vector.sub(d.target, d.pos);
      d.pos.add(dir.mult(0.05)); // 慢慢移動靠近目標
    } else {
      // 自由飄浮模式
      d.pos.add(d.vel);
      // 範圍限制在第一象限 (x: baseWidth/2~baseWidth, y: 0~baseHeight/2)
      if (d.pos.x < baseWidth*0.22 || d.pos.x > baseWidth-25) d.vel.x *= -1;
      if (d.pos.y < 25 || d.pos.y > baseHeight*0.73) d.vel.y *= -1;

      // 偶爾微調速度方向，讓飄浮更自然
      if (random() < 0.01) {
        d.vel = p5.Vector.random2D().mult(0.5);
      }
    }
    text("點", d.pos.x, d.pos.y);
  }
}

// 畫右下角的❤
function drawHeart() {
  textSize(heartSize);
  noStroke();

  // 愛心顏色可閃爍
  let flicker = map(sin(frameCount * 0.1), -1, 1, 75, 255);
  fill(255, 0, 0, flicker);
  text("❤", heartPos.x, heartPos.y);
}

// 產生心型點座標，並分配給dots.target
function generateHeartShape() {
  // 心型參考方程式 x = 16sin^3(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
  // 縮放、移動到第一象限範圍
  let scale = 10;
  let centerX = baseWidth * 0.6;
  let centerY = baseHeight * 0.35;

  for (let i = 0; i < dots.length; i++) {
    let t = map(i, 0, dots.length - 1, 0, TWO_PI);
    let x = 16 * pow(sin(t), 3);
    let y = 13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t);

    // p5坐標系y向下, 心型y向上要反轉
    dots[i].target = createVector(centerX + x * scale, centerY - y * scale);
  }
}

// 處理觸控事件
let inputCooldown = false;

function handleInput(x, y) {
  let scaleFactor = canvasSize / baseWidth;
  let px = x / scaleFactor;
  let py = y / scaleFactor;

  // 觸發漣漪效果
  ripples.push({ x: px, y: py, radius: 5, alpha: 255 });

  // 判斷是否點擊在❤上，若在範圍內則切換排列狀態
  if (dist(px, py, heartPos.x, heartPos.y) < heartSize) {
    arrangingHeart = true;
    generateHeartShape();
  }
}

// 滑鼠按下
function mousePressed() {
  if (!inputCooldown && touches.length === 0) {  // 觸控優先判斷，避免重複
    handleInput(mouseX, mouseY);
    inputCooldown = true;
    setTimeout(() => inputCooldown = false, 100);
  }
}

// 滑鼠放開時取消排列成心型，恢復自由飄浮
function mouseReleased() {
  arrangingHeart = false;
  for (let d of dots) {
    d.target = null;
  }
}

// 觸控開始
function touchStarted() {
  if (!inputCooldown && touches.length > 0) {
    for (let t of touches) {
      handleInput(t.x, t.y);
    }
    inputCooldown = true;
    setTimeout(() => inputCooldown = false, 100);
  }
  return false;
}

// 觸控結束時取消排列成心型
function touchEnded() {
  arrangingHeart = false;
  for (let d of dots) {
    d.target = null;
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