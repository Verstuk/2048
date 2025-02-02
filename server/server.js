require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Токен вашего бота
const token = process.env.TELEGRAM_BOT_TOKEN;

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Создаем Express сервер
const app = express();
const port = 3000;

// URL вашей игры (замените на реальный URL)
const gameUrl = 'https://2048-umber-kappa.vercel.app/client/index.html';

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы начать игру.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Играть в 2048', callback_game: '2048' }]
      ]
    }
  });
});

// Обработка нажатия на кнопку "Играть"
bot.on('callback_query', (query) => {
  if (query.game_short_name === '2048') {
    bot.answerCallbackQuery(query.id, { url: gameUrl });
  }
});

// Запуск сервера
app.get('/', (req, res) => {
  res.send('Telegram 2048 Game Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});