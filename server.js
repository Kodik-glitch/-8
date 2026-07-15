const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Массив для хранения истории (последние 200 сообщений)
let chatHistory = [];
// Счётчик пользователей онлайн
let onlineCount = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // Увеличиваем счётчик при подключении нового пользователя
  onlineCount++;
  // Отправляем обновлённое число онлайн всем
  io.emit('online count', onlineCount);

  console.log(`Пользователь подключился. Всего в сети: ${onlineCount}`);

  // Отправляем историю сообщений новому пользователю при входе
  socket.emit('chat history', chatHistory);

  socket.on('chat message', (data) => {
    // Автоматически добавляем серверное время отправки (в формате ЧЧ:ММ)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const messageWithTime = {
      name: data.name,
      text: data.text,
      time: `${hours}:${minutes}`
    };

    // Добавляем сообщение с временем в историю
    chatHistory.push(messageWithTime);
    
    if (chatHistory.length > 200) {
      chatHistory.shift();
    }

    // Рассылаем сообщение с временем всем участникам чата
    io.emit('chat message', messageWithTime);
  });

  socket.on('disconnect', () => {
    // Уменьшаем счётчик при отключении
    onlineCount = Math.max(0, onlineCount - 1);
    io.emit('online count', onlineCount);
    console.log(`Пользователь отключился. Всего в сети: ${onlineCount}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
