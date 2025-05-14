let dotCommaLines = [
  " 	點點點",
  " 點點點點點",
  " 點點點點點",
  "    點點點逗",
  "            逗",
  "          逗",
  "        逗"
];

// 跳舞的「點」位置：[row, col]
let dancingDots = [
  [0, 2],[0, 4],[2, 1],[2, 5],[3, 4],[3, 5],[3, 6],	
];

function setup() {
  createCanvas(600, 600);
  noFill();
  textAlign(CENTER, CENTER);
  textFont("Noto Serif TC");
}

function draw() {
  background(0);
	drawFrame();
	drawTypewriterText();
	
	push();
		drawDotArt();
	pop();
	
  push();
  	translate(100, height * 0.75);
  	//scale(1, -1);
  	drawAxesText(); // 用文字畫軸線
  	drawFireText(); // 用「火」字畫火焰
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

let typewriterText = "逗點，生活中有時候要停下來休息一下 偶爾要讓自己放鬆歡笑";
let typedLength = 0;
let lastTypedTime = 0;
let typingSpeed = 100; // 毫秒間隔

function drawTypewriterText() {
  let x = width * 0.3;
  let y = height * 0.85;

  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  noStroke();

  if (millis() - lastTypedTime > typingSpeed && typedLength < typewriterText.length) {
    typedLength++;
    lastTypedTime = millis();
  }

  let displayedText = typewriterText.substring(0, typedLength);
  text(displayedText, x, y, width * 0.4); // 限制寬度換行
}

function drawAxesText() {
  let flicker = map(sin(frameCount * 0.05), -1, 1, 80, 200);
  let glowColor = color(0, 255, 255, flicker);
  let brightColor = color(0, 255, 255);

  textSize(14);
  fill(glowColor);
  noStroke();

  let exclusionRadius = 50; // 避免畫到火焰字的區域

  for (let i = -width + 520; i < width - 120; i += 20) {
    if (dist(i, 0, 0, 0) > exclusionRadius - 20 && i !== 0) {
      text("點,", i + 10, 0);
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

    // 增加「風」效果，讓火焰有點飄動感
    let windEffect = sin(frameCount * 0.1 + layer.y * 0.1) * 3;

    textSize(layer.size);
    for (let i = 0; i < layer.count; i++) {
      let wobble = sin(frameCount * 0.1 + i) * 1.5 + windEffect;
      text("火", offsetX + i * spacing + wobble, layer.y);
    }
  }
}

function drawDotArt() {
  let startX = width * 0.45;
  let startY = height * 0.15;
  let lineHeight = 35;

  textSize(32);
  textAlign(LEFT, TOP);
  noStroke();

  for (let i = 0; i < dotCommaLines.length; i++) {
    let y = startY + i * lineHeight;
    let x = startX;

    for (let j = 0; j < dotCommaLines[i].length; j++) {
      let char = dotCommaLines[i][j];

      let isDancing = dancingDots.some(([row, col]) => row === i && col === j);

      if (char == "點") {
        if (isDancing) {
          // 閃爍 & 跳舞 & 彩色
          let flicker = map(sin(frameCount * 0.2 + i + j), -1, 1, 100, 255);
          fill(color(255, 255, 0, flicker));
          let bounce = sin(frameCount * 0.3 + i + j) * 1;
          text(char, x, y + bounce);
        } else {
          fill(255);
          text(char, x, y);
        }
      } else if (char == "逗") {
        fill(255);
        //let dx = random(-1.5, 1.5);抖動
        //let dy = random(-1.5, 1.5);抖動
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}