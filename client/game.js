const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 4; // Размер сетки 4x4
const tileSize = canvas.width / gridSize;

let board = [];
let score = 0;

// Инициализация игрового поля
function initBoard() {
  board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  addRandomTile();
  addRandomTile();
  drawBoard();
}

// Добавление случайной плитки (2 или 4)
function addRandomTile() {
  const emptyTiles = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (board[row][col] === 0) {
        emptyTiles.push({ row, col });
      }
    }
  }
  if (emptyTiles.length > 0) {
    const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Отрисовка игрового поля
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      drawTile(row, col, board[row][col]);
    }
  }
}

// Отрисовка одной плитки
function drawTile(row, col, value) {
  const x = col * tileSize;
  const y = row * tileSize;

  // Цвет фона плитки
  ctx.fillStyle = getTileColor(value);
  ctx.fillRect(x, y, tileSize, tileSize);

  // Текст на плитке
  if (value !== 0) {
    ctx.fillStyle = value >= 8 ? '#f9f6f2' : '#776e65';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x + tileSize / 2, y + tileSize / 2);
  }
}

// Получение цвета плитки
function getTileColor(value) {
  const colors = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  return colors[value] || '#cdc1b4';
}

// Обработка движения плиток
function moveTiles(direction) {
  let moved = false;

  if (direction === 'up' || direction === 'down') {
    for (let col = 0; col < gridSize; col++) {
      const column = [];
      for (let row = 0; row < gridSize; row++) {
        column.push(board[row][col]);
      }
      const newColumn = slideAndMerge(column, direction === 'down');
      for (let row = 0; row < gridSize; row++) {
        if (board[row][col] !== newColumn[row]) {
          moved = true;
          board[row][col] = newColumn[row];
        }
      }
    }
  } else if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < gridSize; row++) {
      const newRow = slideAndMerge(board[row], direction === 'right');
      if (JSON.stringify(board[row]) !== JSON.stringify(newRow)) {
        moved = true;
        board[row] = newRow;
      }
    }
  }

  if (moved) {
    addRandomTile();
    drawBoard();
    checkGameOver();
  }
}

// Сдвиг и слияние плиток
function slideAndMerge(line, reverse) {
  if (reverse) line.reverse();

  const result = [];
  let lastValue = null;

  for (const value of line) {
    if (value === 0) continue;
    if (lastValue === null) {
      lastValue = value;
    } else if (lastValue === value) {
      result.push(lastValue * 2);
      score += lastValue * 2;
      document.getElementById('score').textContent = score;
      lastValue = null;
    } else {
      result.push(lastValue);
      lastValue = value;
    }
  }

  if (lastValue !== null) result.push(lastValue);

  while (result.length < gridSize) {
    result.push(0);
  }

  return reverse ? result.reverse() : result;
}

// Проверка на конец игры
function checkGameOver() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (board[row][col] === 0) return; // Есть пустые клетки
      if (
        (row > 0 && board[row][col] === board[row - 1][col]) ||
        (row < gridSize - 1 && board[row][col] === board[row + 1][col]) ||
        (col > 0 && board[row][col] === board[row][col - 1]) ||
        (col < gridSize - 1 && board[row][col] === board[row][col + 1])
      ) {
        return; // Можно слить плитки
      }
    }
  }
  alert('Game Over!');
}

// Обработка нажатий клавиш
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') moveTiles('up');
  if (event.key === 'ArrowDown') moveTiles('down');
  if (event.key === 'ArrowLeft') moveTiles('left');
  if (event.key === 'ArrowRight') moveTiles('right');
});

// Запуск игры
initBoard();