require('dotenv').config(); // Загружает переменные из .env

const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
let leaderboard = [];

// API для лидерборда
app.post('/api/leaderboard', (req, res) => {
  const { userId, score } = req.body;
  leaderboard.push({ userId, score });
  leaderboard = [...new Set(leaderboard)]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.send({ success: true });
});

app.get('/api/leaderboard', (req, res) => {
  res.send(leaderboard);
});

// Команда с кнопкой лидерборда
bot.command('start', (ctx) => {
  ctx.reply('🎮 2048 в Telegram!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Играть", web_app: { url: process.env.WEBAPP_URL } }],
        [{ text: "Таблица лидеров", callback_data: "show_leaderboard" }]
      ]
    }
  });
});

bot.action('show_leaderboard', async (ctx) => {
  const leaders = leaderboard.map((u, i) => `${i+1}. ID${u.userId}: ${u.score}`).join('\n');
  ctx.reply(`🏆 Топ игроков:\n${leaders || 'Пока нет результатов!'}`);
});

app.use(express.static('client'));
bot.launch();
app.listen(3000, () => console.log('Сервер запущен на порту 3000'));