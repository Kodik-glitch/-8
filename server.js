const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Массив для хранения истории (теперь последние 200 сообщений)
let chatHistory = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Пользователь подключился');

  // Отправляем историю (до 200 сообщений) новому пользователю при входе
  socket.emit('chat history', chatHistory);

  socket.on('chat message', (data) => {
    // Добавляем новое сообщение в историю
    chatHistory.push(data);
    
    // Если сообщений стало больше 200, удаляем самое старое
    if (chatHistory.length > 200) {
      chatHistory.shift();
    }

    // Рассылаем сообщение всем участникам чата
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
