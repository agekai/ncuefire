let canvas;
let canvasSize;
let baseWidth = 600;
let baseHeight = 600;

let annotationText = "喔喔喔喔喔~~~。\n(🔍互動提示：轉轉轉)";
let annotationIndex = 0;
let annotationElement;
let annotationSpeed = 50;

let angleX = 0;
let angleY = 0;
let vertices = [];

function setup() {
  let container = document.getElementById('canvas-container');
  canvas = createCanvas(baseWidth, baseHeight);
  canvas.parent(container);

  canvas.elt.addEventListener('touchstart', function (e) {
    e.preventDefault();
  }, { passive: false });

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
  vertices = [
    [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
    [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]
  ];
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

  // 原點火焰與線軸
  push();
  translate(100, baseHeight * 0.75); // 使用邏輯高度600
  drawAxesText();
  drawFireText();
  pop();

  // 第一象限立方體
  drawCubeText();

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

function drawCubeText() {
  push();
  translate(baseWidth * 0.6, baseHeight * 0.35); // 移到第一象限

  let projected = [];

  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];

    let x = v[0];
    let y = v[1] * cos(angleX) - v[2] * sin(angleX);
    let z = v[1] * sin(angleX) + v[2] * cos(angleX);

    let tempX = x * cos(angleY) - z * sin(angleY);
    let tempZ = x * sin(angleY) + z * cos(angleY);

    let scale = 200 / (tempZ + 3); // 放大立方體
    let projectedX = tempX * scale;
    let projectedY = y * scale;

    projected.push([projectedX, projectedY]);
  }

  drawASCIIEdge(0, 1, projected);
  drawASCIIEdge(1, 3, projected);
  drawASCIIEdge(3, 2, projected);
  drawASCIIEdge(2, 0, projected);

  drawASCIIEdge(4, 5, projected);
  drawASCIIEdge(5, 7, projected);
  drawASCIIEdge(7, 6, projected);
  drawASCIIEdge(6, 4, projected);

  drawASCIIEdge(0, 4, projected);
  drawASCIIEdge(1, 5, projected);
  drawASCIIEdge(2, 6, projected);
  drawASCIIEdge(3, 7, projected);

  for (let pt of projected) {
    fill(255, 100, 0, 200);
    textSize(16);
    text("點", pt[0], pt[1]);
  }

  pop();

  angleX += 0.02;
  angleY += 0.03;
}

function drawASCIIEdge(i, j, projected) {
  let a = projected[i];
  let b = projected[j];

  let steps = 10;
  for (let k = 1; k < steps; k++) {
    let lerpX = lerp(a[0], b[0], k / steps);
    let lerpY = lerp(a[1], b[1], k / steps);
    fill(0, 255, 255, 100);
    textSize(14);
    text("線", lerpX, lerpY);
  }
}

function typeWriter() {
  if (annotationIndex < annotationText.length) {
    annotationElement.textContent += annotationText.charAt(annotationIndex);
    annotationIndex++;
    setTimeout(typeWriter, annotationSpeed);
  }
}