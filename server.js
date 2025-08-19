const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// === Настройки ===
const BOT_TOKEN = '8201854169:AAH4YwzSKOG3miisen8jqfEM_pVFwhl1eNk'; // ← Замени!
const ADMIN_CHAT_ID = '175653928'; // ← Замени!
const WEB_APP_URL = 'https://telegram-food-app.vercel.app';

// === Парсим JSON ===
app.use(bodyParser.json());

// === Обработка POST-запросов с заказами ===
app.post('/api/order', async (req, res) => {
  const { id, name, price } = req.body;

  const message = `📦 Новый заказ:\n\n${name} — ${price} ₽`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message,
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Принять заказ", callback_data: `accept_order_${id}` }]
          ]
        }
      })
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send order' });
  }
});

// === Вебхук для Telegram бота (команды) ===
app.post(`/bot${BOT_TOKEN}`, async (req, res) => {
   // Добавь лог для проверки
  console.log('Пришло обновление:', req.body);
  
  const message = req.body.message;
  if (!message) {
    console.log('Нет сообщения');
    return res.status(200).send(); // ✅ Всегда отвечай!
  }

  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    const welcome = `🍔 Добро пожаловать в <b>БыстроЕда</b>!\n\nНажмите /menu, чтобы открыть меню.`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: welcome,
        parse_mode: 'HTML'
      })
    });
  }

  if (text === '/menu') {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🍽 Откройте меню:',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Открыть меню', web_app: { url: WEB_APP_URL } }]
          ]
        }
      })
    });
  }

  res.status(200).send();
});

// === Главная страница (проверка) ===
app.get('/', (req, res) => {
  res.send('Backend is running! 🚀');
});

// === Запуск сервера ===
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);

});


