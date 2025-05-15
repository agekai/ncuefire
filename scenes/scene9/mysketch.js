let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "這是第9幕的文字註解，用打字機效果逐字出現。\n你可以修改這段文字內容。";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let angleX = 0;
let angleY = 0;

let engineOn = false; // 引擎開關
let keyX, keyY;        // 鑰匙位置

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

  frameRate(30);
	
  keyX = baseWidth * 0.6;
  keyY = baseHeight * 0.85;
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

  // 左下角火焰與線軸
  push();
  translate(100, baseHeight * 0.75); // 使用邏輯高度600
  drawAxesText();
  drawFireText();
  pop();

  // 右上角賽車文字
  drawF1Text();
	  // 畫出鑰匙
  drawKey();

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

function drawKey() {
  textSize(20);
  fill(engineOn ? color(255, 255, 0) : color(180)); // 黃色代表啟動

  text("鑰匙🗝", keyX, keyY);
}

function mousePressed() {
  // 把滑鼠座標換算回原始比例
  let scaleFactor = canvasSize / baseWidth;
  let scaledMouseX = mouseX / scaleFactor;
  let scaledMouseY = mouseY / scaleFactor;

  let d = dist(scaledMouseX, scaledMouseY, keyX, keyY);
  if (d < 30) {
    engineOn = !engineOn; // 點擊切換引擎狀態
  }
}


function drawF1Text() {
  push();
  translate(baseWidth * 0.6, baseHeight * 0.35);

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

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}
