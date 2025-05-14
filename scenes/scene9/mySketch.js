let angleX = 0;
let angleY = 0;

let engineOn = false; // 引擎開關
let keyX, keyY;        // 鑰匙位置

function setup() {
  createCanvas(600, 600);
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
  frameRate(30);
	
	keyX = width * 0.9;
  keyY = height * 0.8;
}

function draw() {
  background(0);
	drawFrame();

  // 左下角火焰與線軸
  push();
  translate(100, height * 0.75);
  drawAxesText();
  drawFireText();
  pop();

  // 右上角賽車文字
  drawF1Text();
	  // 畫出鑰匙
  drawKey();
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

  let exclusionRadius = 50;

  for (let i = -width + 520; i < width - 120; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點", i + 10, 0);
    }
  }

  for (let j = -height + 180; j < height - 460; j += 20) {
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

function drawKey() {
  textSize(20);
  fill(engineOn ? color(0, 255, 0) : color(180)); // 綠色代表啟動
  text("鑰匙", keyX, keyY);
}

function mousePressed() {
  let d = dist(mouseX, mouseY, keyX, keyY);
  if (d < 30) {
    engineOn = !engineOn; // 點擊切換引擎狀態
  }
}

function drawF1Text() {
  push();
  translate(width * 0.6, height * 0.35);

  // 引擎抖動效果
  let shakeX = engineOn ? sin(frameCount * 0.5) * 2 : 0;
  let shakeY = engineOn ? cos(frameCount * 0.5) * 2 : 0;
  translate(shakeX, shakeY);

  textAlign(CENTER, CENTER);

  // 車體主體（車字）
	textSize(25);
  fill(255,0,0);
	text("車", -40, 0);
	text("車",  40, 0);
	text("車", -60, 38);
	text("車",  60, 38);
  for (let i = -40; i <= 40; i += 20) {
		text("車", i, -20);
    text("車", i, 20);
		text("車", i, 55);
  }
	//頭燈(燈字)
	textSize(12);
  fill(255,255,0);
	text("燈", -30, 35);
	text("燈", 30, 35);
  // 駕駛（人字）
  textSize(18);
	fill(255);
  text("人", 20, 0);
  // 輪子（輪字）
  textSize(20);
	fill("gray");
  text("輪", -40, 75);
  text("輪", 40, 75);

  // 排氣煙（煙字漂浮動畫）
	if (engineOn) {
  	let smokeCount = 5;
  	for (let i = 0; i < smokeCount; i++) {
    	let t = frameCount * 0.05 + i;
    	let x = -60 - i * 8 + sin(t) * 3;
    	let y = i * -10 + cos(t) * 2;
    	textSize(16 - i * 1.2);
    	fill(200, 200, 200, 150 - i * 20);
    	text("煙", x, y);
  	}
	}
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
