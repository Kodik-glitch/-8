const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Отдаем пользователю наш интерфейс (index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Обработка подключений
io.on('connection', (socket) => {
  console.log('Кто-то зашел в чат!');

  // Слушаем событие отправки сообщения
  socket.on('chat message', (data) => {
    // Рассылаем это сообщение вообще всем подключенным пользователям
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь покинул чат.');
  });
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Чат работает на порту ${PORT}`);
});
