const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const image = document.createElement("img");
image.src = "./gameover.png";
const control = document.getElementById("phoneControls");

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight - 100;

canvas.width = windowWidth;
canvas.height = windowHeight;
document.body.append(canvas);

const Direction = {
  ArrowLeft: 0,
  ArrowRight: 1,
  ArrowUp: 2,
  ArrowDown: 3,
};
const map = {
  data: [],
  paddingX: 60,
  paddingTop: 40,
  paddingBottom: 160,
};
const mapSizeX = canvas.width - map.paddingX * 2;
const mapSizeY = canvas.height - map.paddingTop - map.paddingBottom;

let gameover = false;
let overSize = 0;
let overIntervalIndex = -1;
let level = 0;
let row = (level + 1) * 18;
let rank = (level + 1) * 18;
let blockSize = 0;

const calcRotatedPointByRadian = (prev, center, rotation) => {
  return {
    x:
      (prev.x - center.x) * Math.cos(rotation) -
      (prev.y - center.y) * Math.sin(rotation) +
      center.x,
    y:
      (prev.x - center.x) * Math.sin(rotation) +
      (prev.y - center.y) * Math.cos(rotation) +
      center.y,
  };
};

if (mapSizeX / mapSizeY > rank / row) {
  blockSize = mapSizeY / row;
} else {
  blockSize = mapSizeX / rank;
}

const food = {
  x: 8,
  y: 8,
};

const snake = {
  direction: 0,
  data: [
    { x: 10, y: 10 },
    { x: 11, y: 10 },
    { x: 12, y: 10 },
  ],
  map: {},
};

let intervalIndex = -1;

function updateSnakeMap() {
  snake.map = {};
  snake.data.forEach((item) => {
    if (!snake.map[item.x]) {
      snake.map[item.x] = {};
    }
    snake.map[item.x][item.y] = 1;
  });
}

function snakeMove() {
  const next = {
    x: snake.data[0].x,
    y: snake.data[0].y,
  };
  switch (snake.direction) {
    case Direction.ArrowLeft: {
      next.x -= 1;
      break;
    }
    case Direction.ArrowRight: {
      next.x += 1;
      break;
    }
    case Direction.ArrowUp: {
      next.y -= 1;
      break;
    }
    case Direction.ArrowDown: {
      next.y += 1;
      break;
    }
  }
  if (checkOver(next)) {
    overSize = 0;
    control.style.display = "none";
    overIntervalIndex = setInterval(() => {
      overSize += 0.01;
      if (overSize >= 1) {
        clearInterval(overIntervalIndex);
        btn.innerText = "重新开始";
        btn.style.display = "block";
      }
    }, 10);
    pauseGame();
    return;
  }
  snake.data.unshift(next);
  if (next.x !== food.x || next.y !== food.y) {
    snake.data.pop();
    updateSnakeMap();
  } else {
    updateSnakeMap();
    initFood();
  }
  resetInterval();
}

function checkOver(next) {
  const finalIndex = snake.data.length - 1;
  if (
    next.x !== snake.data[finalIndex].x ||
    next.y !== snake.data[finalIndex].y
  ) {
    if (snake.map[next.x] && snake.map[next.x][next.y]) return true;
  }
  if (next.x >= rank || next.x < 0 || next.y < 0 || next.y >= row) return true;
  return false;
}

function keyDownEvent(e) {
  switch (e.key) {
    case "ArrowLeft": {
      if (snake.direction !== Direction["ArrowRight"]) {
        snake.direction = Direction[e.key];
        snakeMove();
      }
      break;
    }
    case "ArrowRight": {
      if (snake.direction !== Direction["ArrowLeft"]) {
        snake.direction = Direction[e.key];
        snakeMove();
      }
      break;
    }
    case "ArrowUp": {
      if (snake.direction !== Direction["ArrowDown"]) {
        snake.direction = Direction[e.key];
        snakeMove();
      }
      break;
    }
    case "ArrowDown": {
      if (snake.direction !== Direction["ArrowUp"]) {
        snake.direction = Direction[e.key];
        snakeMove();
      }
      break;
    }
  }
}

function resetInterval() {
  clearTimeout(intervalIndex);
  intervalIndex = setTimeout(() => {
    console.log("触发了");
    snakeMove();
  }, 1000 - snake.data.length);
}

function startGame() {
  window.addEventListener("keydown", keyDownEvent);
  btn.style.display = "none";
  overSize = 0;
  checkPhone();
  food.x = 8;
  food.y = 8;

  snake.direction = 0;
  snake.data = [
    { x: 10, y: 10 },
    { x: 11, y: 10 },
    { x: 12, y: 10 },
  ];
  resetInterval();
}

function pauseGame() {
  clearTimeout(intervalIndex);
  window.removeEventListener("keydown", keyDownEvent);
}

function initFood() {
  const length = row * rank - snake.data.length;
  let index = (Math.random() * length) >> 0;
  map.data.forEach((line, i) => {
    line.map((block, j) => {
      if (!snake.map[i] || !snake.map[i][j]) {
        index--;
        if (!index) {
          food.x = j;
          food.y = i;
        }
      }
    });
  });
}

function initMap() {
  map.data = [];
  for (let i = 0; i < row; i++) {
    map.data[i] = [];
    for (let j = 0; j < rank; j++) {
      map.data[i][j] = 0;
    }
  }
}

function drawSnake() {
  const top = (mapSizeY - blockSize * row) / 2 + map.paddingTop;
  const left = (mapSizeX - blockSize * rank) / 2 + map.paddingX;
  const bodyOffsetSize = blockSize / 2 / snake.data.length;
  ctx.beginPath();
  ctx.fillStyle = "#999";
  snake.data.forEach((item, index) => {
    const x = left + (item.x + 0.5) * blockSize;
    const y = top + (item.y + 0.5) * blockSize;
    const size = blockSize - index * bodyOffsetSize;
    ctx.moveTo(x, y);
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  });
  ctx.fill();
  // 绘制眼睛

  const headItme = snake.data[0];
  let eye1X = left + (headItme.x + 0.5) * blockSize;
  let eye1Y = top + (headItme.y + 0.5) * blockSize;
  let eye2X = left + (headItme.x + 0.5) * blockSize;
  let eye2Y = top + (headItme.y + 0.5) * blockSize;

  switch (snake.direction) {
    case Direction.ArrowLeft: {
      eye1X -= blockSize / 4;
      eye2X -= blockSize / 4;
      eye1Y -= blockSize / 4;
      eye2Y += blockSize / 4;
      break;
    }
    case Direction.ArrowRight: {
      eye1X += blockSize / 4;
      eye2X += blockSize / 4;
      eye1Y -= blockSize / 4;
      eye2Y += blockSize / 4;
      break;
    }
    case Direction.ArrowUp: {
      eye1X -= blockSize / 4;
      eye2X += blockSize / 4;
      eye1Y -= blockSize / 4;
      eye2Y -= blockSize / 4;
      break;
    }
    case Direction.ArrowDown: {
      eye1X += blockSize / 4;
      eye2X -= blockSize / 4;
      eye1Y += blockSize / 4;
      eye2Y += blockSize / 4;
      break;
    }
  }
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.moveTo(eye1X, eye1Y);
  ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
  ctx.moveTo(eye2X, eye2Y);
  ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// 绘制食物
function drawFood() {
  const top = (mapSizeY - blockSize * row) / 2 + map.paddingTop;
  const left = (mapSizeX - blockSize * rank) / 2 + map.paddingX;
  ctx.beginPath();
  ctx.fillStyle = "#F20";
  ctx.rect(
    left + food.x * blockSize,
    top + food.y * blockSize,
    blockSize,
    blockSize
  );
  ctx.fill();
}

function drawMap() {
  const top = (mapSizeY - blockSize * row) / 2 + map.paddingTop;
  const bottom = top + blockSize * row;
  const left = (mapSizeX - blockSize * rank) / 2 + map.paddingX;
  const right = left + blockSize * rank;

  ctx.beginPath();
  for (let i = 1; i < rank; i++) {
    ctx.moveTo(blockSize * i + left, top);
    ctx.lineTo(blockSize * i + left, bottom);
  }
  for (let i = 1; i < row; i++) {
    ctx.moveTo(left, blockSize * i + top);
    ctx.lineTo(right, blockSize * i + top);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ddd";
  ctx.stroke();
  map.data.forEach((line) => {
    line.forEach((block) => {
      if (block) {
      }
    });
  });
  ctx.beginPath();
  ctx.rect(left, top, blockSize * rank, blockSize * row);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawOverPicture() {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 4);
  ctx.scale(overSize, overSize);
  ctx.drawImage(image, image.width / -2, image.height / -2);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px 默认字体";
  drawSnake();
  drawFood();
  drawMap();
  drawOverPicture();
  ctx.fillStyle = "#000";
  ctx.fillText(`当前难度: ${snake.data.length}`, 100, 20);
  requestAnimationFrame(draw);
}

window.addEventListener("touchmove", (e) => {
  e.preventDefault();
});
image.onload = () => {
  updateSnakeMap();
  initMap();
  draw();
};
const btn = document.getElementById("startButton");
btn.onclick = () => {
  startGame();
};
btn.style.left = (windowWidth - 100) / 2 + "px";
btn.style.top = windowHeight / 2 + "px";
const ua = window.navigator.userAgent;
let hasCheckPhone = false;
function checkPhone() {
  if (ua.indexOf("Android") >= 0 || ua.indexOf("iPhone") >= 0) {
    control.style.display = "block";
    if (hasCheckPhone) return;
    const topButton = document.getElementById("topButton");
    const downButton = document.getElementById("downButton");
    const leftButton = document.getElementById("leftButton");
    const rightButton = document.getElementById("rightButton");
    topButton.style.left = (windowWidth - 50) / 2 + "px";
    topButton.style.top = windowHeight - 80 + "px";
    downButton.style.left = (windowWidth - 50) / 2 + "px";
    downButton.style.top = windowHeight - 20 + "px";
    leftButton.style.left = (windowWidth - 50) / 2 - 60 + "px";
    leftButton.style.top = windowHeight - 20 + "px";
    rightButton.style.left = (windowWidth - 50) / 2 + 60 + "px";
    rightButton.style.top = windowHeight - 20 + "px";

    topButton.onclick = () => {
      if (snake.direction !== Direction["ArrowDown"]) {
        snake.direction = Direction["ArrowUp"];
        snakeMove();
      }
    };
    downButton.onclick = () => {
      if (snake.direction !== Direction["ArrowUp"]) {
        snake.direction = Direction["ArrowDown"];
        snakeMove();
      }
    };
    leftButton.onclick = () => {
      if (snake.direction !== Direction["ArrowRight"]) {
        snake.direction = Direction["ArrowLeft"];
        snakeMove();
      }
    };
    rightButton.onclick = () => {
      if (snake.direction !== Direction["ArrowLeft"]) {
        snake.direction = Direction["ArrowRight"];
        snakeMove();
      }
    };
  }
  hasCheckPhone = true;
}
