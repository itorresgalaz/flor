const WIDTH = 1000;
const HEIGHT = 850;
const CX = WIDTH / 2;
const CY = 350;

const TEPALS = [
  [72, 270, 74, -26],
  [22, 252, 76, 18],
  [142, 258, 73, -28],
  [208, 238, 79, 30],
  [326, 242, 76, -32],
  [274, 226, 72, 18],
];

const STAMENS = [
  [26, 147],
  [48, 162],
  [72, 174],
  [103, 172],
  [132, 158],
  [154, 143],
];

const canvas = document.querySelector("#flower-canvas");
const ctx = canvas.getContext("2d");
let progress = 0.05;
let animating = false;
let opened = false;
let windPhase = 0;

function rotate(x, y, angle) {
  const radians = (angle * Math.PI) / 180;
  return [
    x * Math.cos(radians) - y * Math.sin(radians),
    x * Math.sin(radians) + y * Math.cos(radians),
  ];
}

function bezier(p0, p1, p2, p3, t) {
  const inverse = 1 - t;
  return [
    inverse ** 3 * p0[0]
      + 3 * inverse ** 2 * t * p1[0]
      + 3 * inverse * t ** 2 * p2[0]
      + t ** 3 * p3[0],
    inverse ** 3 * p0[1]
      + 3 * inverse ** 2 * t * p1[1]
      + 3 * inverse * t ** 2 * p2[1]
      + t ** 3 * p3[1],
  ];
}

function petalPoints(angle, length, width, openness, curl = 0) {
  length *= openness;
  width *= openness;

  const p0 = [0, 0];
  const left1 = [length * 0.18, width * 0.95];
  const left2 = [length * 0.65, width * 0.7];
  const tip = [length, curl * openness];
  const right2 = [length * 0.65, -width * 0.7];
  const right1 = [length * 0.18, -width * 0.95];
  const points = [];

  for (let i = 0; i <= 45; i += 1) {
    const [x, y] = rotate(...bezier(p0, left1, left2, tip, i / 45), angle);
    points.push(CX + x, CY + y);
  }

  for (let i = 0; i <= 45; i += 1) {
    const [x, y] = rotate(...bezier(tip, right2, right1, p0, i / 45), angle);
    points.push(CX + x, CY + y);
  }

  points.push(points[0], points[1]);
  return points;
}

function polygon(points, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawPetal(angle, length, width, openness, wind, curl = 0) {
  angle += wind * 0.1;
  const shadow = petalPoints(angle, length, width, openness, curl);
  const shifted = [];

  for (let i = 0; i < shadow.length; i += 2) {
    shifted.push(shadow[i] + 7, shadow[i + 1] + 9);
  }
  polygon(shifted, "#29312b");

  polygon(
    petalPoints(angle, length, width, openness, curl),
    "#f4f0e5",
    "#fffdf6",
  );
  polygon(
    petalPoints(angle, length * 0.78, width * 0.35, openness, curl * 0.4),
    "#fffdf6",
  );

  const [ex, ey] = rotate(length * 0.36 * openness, 0, angle);
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.lineTo(CX + ex, CY + ey);
  ctx.strokeStyle = "#c4d38a";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();

  for (const offset of [-0.16, 0, 0.16]) {
    const [veinX, veinY] = rotate(
      length * 0.76 * openness,
      width * offset * openness,
      angle,
    );
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + veinX, CY + veinY);
    ctx.strokeStyle = "#d7dfb0";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawStem(wind) {
  const x = CX + wind * 0.3;
  ctx.beginPath();
  ctx.moveTo(x, CY + 20);
  ctx.bezierCurveTo(x, 520, x + 8, 690, x - 5, HEIGHT);
  ctx.strokeStyle = "#315c37";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 2, CY + 25);
  ctx.bezierCurveTo(x + 3, 520, x + 8, 690, x - 3, HEIGHT);
  ctx.strokeStyle = "#6f956a";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawLeaf(x, y, angle, length, width) {
  const points = [];
  for (let i = 0; i <= 30; i += 1) {
    const p = i / 30;
    const [rx, ry] = rotate(p * length, Math.sin(p * Math.PI) * width, angle);
    points.push(x + rx, y + ry);
  }
  for (let i = 30; i >= 0; i -= 1) {
    const p = i / 30;
    const [rx, ry] = rotate(p * length, -Math.sin(p * Math.PI) * width, angle);
    points.push(x + rx, y + ry);
  }
  polygon(points, "#2f5936", "#69906b", 2);

  const [tipX, tipY] = rotate(length, 0, angle);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + tipX, y + tipY);
  ctx.strokeStyle = "#91ab7a";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCenter(openness) {
  const radius = 25 * openness;
  ctx.beginPath();
  ctx.arc(CX, CY, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#bed077";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(CX, CY, 12 * openness, 0, Math.PI * 2);
  ctx.fillStyle = "#e1e8a4";
  ctx.fill();
}

function drawStamens(openness, wind) {
  if (openness < 0.5) return;
  const factor = Math.min(1, (openness - 0.5) / 0.5);

  for (const [baseAngle, baseLength] of STAMENS) {
    const angle = baseAngle + wind * 0.07;
    const length = baseLength * factor;
    const [middleX, middleY] = rotate(length * 0.52, 15, angle);
    const [endX, endY] = rotate(length, 0, angle);

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + middleX, CY + middleY);
    ctx.lineTo(CX + endX, CY + endY);
    ctx.strokeStyle = "#c4c98a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(CX + endX, CY + endY, 8, 4, angle * Math.PI / 180, 0, Math.PI * 2);
    ctx.fillStyle = "#b77a25";
    ctx.fill();
    ctx.strokeStyle = "#dfae48";
    ctx.stroke();
  }

  const [pistilX, pistilY] = rotate(185 * factor, 0, 90);
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.lineTo(CX + pistilX, CY + pistilY);
  ctx.strokeStyle = "#91ad62";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(CX + pistilX, CY + pistilY, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#78954f";
  ctx.fill();
}

function drawText() {
  ctx.textAlign = "center";
  ctx.fillStyle = "#f5f5ef";
  ctx.font = "27px Helvetica, Arial, sans-serif";
  ctx.fillText("T E A M O <3", WIDTH / 2, 65);
  ctx.fillStyle = "#92988f";
  ctx.font = "italic 12px Helvetica, Arial, sans-serif";
  ctx.fillText("Una hermosa flor para una hermosa persona <3", WIDTH / 2, 100);
  ctx.fillStyle = "#686e68";
  ctx.font = "11px Helvetica, Arial, sans-serif";
  ctx.fillText("Haz clic para florecer", WIDTH / 2, HEIGHT - 30);
}

function drawFlower(openness, wind) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawStem(wind);
  drawLeaf(CX + wind * 0.3, 535, 205, 170, 18);
  drawLeaf(CX + wind * 0.3, 610, 335, 150, 16);
  drawLeaf(CX + wind * 0.3, 680, 215, 135, 14);
  drawLeaf(CX + wind * 0.3, 745, 325, 115, 12);

  for (const index of [3, 4, 5, 1, 2, 0]) {
    const [angle, length, width, curl] = TEPALS[index];
    drawPetal(angle, length, width, openness, wind, curl);
  }
  drawCenter(openness);
  drawStamens(openness, wind);
  drawText();
}

function easeOut(value) {
  return 1 - (1 - value) ** 3;
}

function startBloom(event) {
  if (event?.pointerId !== undefined && canvas.setPointerCapture) {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Some synthetic or already-released pointers cannot be captured.
    }
  }
  if (animating) return;
  progress = 0.03;
  animating = true;
  opened = false;
}

function frame() {
  windPhase += animating ? 0.035 : 0.025;
  const wind = Math.sin(windPhase) * 4;

  if (animating) {
    progress = Math.min(1, progress + 0.012);
    drawFlower(easeOut(progress), wind);
    if (progress >= 1) {
      animating = false;
      opened = true;
    }
  } else {
    drawFlower(opened ? 1 : 0.05, wind);
  }
  window.requestAnimationFrame(frame);
}

canvas.addEventListener("pointerdown", startBloom);
drawFlower(progress, 0);
window.requestAnimationFrame(frame);
