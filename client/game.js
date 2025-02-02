let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048-best') || 0;
let isGameOver = false;

// Инициализация игры
function initGame() {
  grid = Array(4).fill().map(() => Array(4).fill(0));
  addNewTile();
  addNewTile();
  updateGrid();
  isGameOver = false;
  document.body.classList.remove('game-over');
}

// Добавление новой плитки
function addNewTile() {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) emptyCells.push({ x: i, y: j });
    }
  }
  if (emptyCells.length > 0) {
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[x][y] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Обновление игрового поля
function updateGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';

  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const tile = document.createElement('div');
      tile.className = `tile tile-${cell}`;
      tile.textContent = cell || '';
      tile.style.setProperty('--x', j);
      tile.style.setProperty('--y', i);
      gridElement.appendChild(tile);
    });
  });

  document.getElementById('score').textContent = score;
  document.getElementById('best').textContent = bestScore;
}

// Сохранение прогресса
function saveProgress() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('2048-best', bestScore);
  }
  localStorage.setItem('2048-game', JSON.stringify({ grid, score }));
}

// Проверка окончания игры
function checkGameOver() {
  const hasMoves = grid.some((row, i) =>
    row.some((cell, j) =>
      cell === 0 ||
      (j < 3 && cell === grid[i][j + 1]) ||
      (i < 3 && cell === grid[i + 1][j])
    )
  );

  if (!hasMoves) {
    isGameOver = true;
    document.body.classList.add('game-over');
    sendToLeaderboard();
  }
}

// Отправка результата на сервер
async function sendToLeaderboard() {
  const user = Telegram.WebApp.initDataUnsafe.user;
  if (score > bestScore) {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        score
      })
    });
  }
}

// Обработка движений
function move(direction) {
  if (isGameOver) return;

  let newGrid = [...grid];
  let moved = false;

  // Логика для всех направлений
  const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]));

  if (['up', 'down'].includes(direction)) {
    newGrid = rotate(newGrid);
  }

  newGrid = newGrid.map(row => {
    let filtered = row.filter(cell => cell !== 0);
    if (direction === 'right' || direction === 'down') filtered.reverse();

    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        score += filtered[i];
        filtered.splice(i + 1, 1);
        moved = true;
      }
    }

    while (filtered.length < 4) filtered.push(0);
    if (direction === 'right' || direction === 'down') filtered.reverse();
    return filtered;
  });

  if (['up', 'down'].includes(direction)) {
    newGrid = rotate(newGrid);
  }

  if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
    grid = newGrid;
    addNewTile();
    moved = true;
  }

  if (moved) {
    updateGrid();
    saveProgress();
    checkGameOver();
  }
}

// Инициализация свайпов
function initSwipe() {
  const hammer = new Hammer(document.body);
  hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

  hammer.on('swipeleft', () => move('left'));
  hammer.on('swiperight', () => move('right'));
  hammer.on('swipeup', () => move('up'));
  hammer.on('swipedown', () => move('down'));
}

// Загрузка сохраненной игры
function loadSavedGame() {
  const saved = localStorage.getItem('2048-game');
  if (saved) {
    const { grid: savedGrid, score: savedScore } = JSON.parse(saved);
    grid = savedGrid;
    score = savedScore;
    updateGrid();
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initSwipe();
  loadSavedGame();
  if (grid.flat().every(cell => cell === 0)) initGame();
});