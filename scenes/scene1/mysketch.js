let dotFlashes = [];
let showAxes = false;

function setup() {
  createCanvas(600, 600);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
  background(0, 40);
	drawFrame(); 

  push();
  createDotFlashes();
  updateDotFlashes();
  pop();

  push();
  translate(100, height * 0.75);
  if (showAxes) {
    drawAxesText(); // 畫軸線（點字）
  }
  drawFireText(); // 畫原點火焰
  pop();
}

function drawFrame() {
  fill(0, 200, 255);
  textSize(16);
  let spacing = 20;
  for (let x = 10; x <= width; x += spacing) {
    text("框", x, 10);
    text("框", x, height - 10);
  }
  for (let y = 10; y < height - 10; y += spacing) {
    text("框", 10, y);
    text("框", width - 10, y);
  }
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  textSize(14);
  fill(glowColor);
  noStroke();

  for (let i = -width + 520; i < width - 120; i += 20) {
    if (i !== 0) text("點", i + 10, 0);
  }
  for (let j = -height + 180; j < height - 460; j += 20) {
    if (j !== 0) text("點", 10, j);
  }
}

function drawFireText() {
  let flicker = map(sin(frameCount * 0.1), -1, 0, 100, 255);
  let flameColor = color(255, 100, 0, flicker);
  textSize(16);
  fill(flameColor);
  noStroke();
  text("原", 10, 0);
}

// 閃現的「點」們
function createDotFlashes() {
  if (frameCount % 10 === 0) {
    let x = random(width * 0.3, width * 0.8);
    let y = random(30, height * 0.6);
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
    let c = color(random(255), random(255), random(255), p.alpha);
    fill(c);
    noStroke();
    text("點", p.x, p.y);
    p.alpha -= 4;
    p.size += p.growth;

    if (p.alpha <= 0) {
      dotFlashes.splice(i, 1);
    }
  }
}

// 偵測觸碰「原」字
function mousePressed() {
  // 轉換 mouse 座標到「原」字的參考座標系
  let localX = mouseX - 100;
  let localY = mouseY - height * 0.75;

  // 假設「原」字的大小是 textSize(16)，以此估算範圍
  let size = 16;
  if (abs(localX) < size && abs(localY) < size) {
    showAxes = !showAxes;
  }
}

function touchStarted() {
  mousePressed(); // 手指觸控也觸發與滑鼠點擊相同邏輯
  return false;   // 防止預設行為（例如頁面滑動）
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
