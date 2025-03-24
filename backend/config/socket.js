const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const configureSocket = (server) => {
const io = socketio(server, {
cors: {
origin: process.env.CLIENT_URL,
methods: ['GET', 'POST']
}
});

io.use(async (socket, next) => {
try {
const token = socket.handshake.auth.token;
const decoded = jwt.verify(token, process.env.JWT_SECRET);
socket.user = decoded.user;
next();
} catch (err) {
next(new Error('Authentication error'));
}
});

io.on('connection', (socket) => {
console.log('New client connected:', socket.user.id);
socket.on('joinRoom', ({ room }) => {
  socket.join(room);
  console.log(`User joined room: ${room}`);
});

socket.on('sendMessage', async ({ text, room }, callback) => {
  try {
    const message = new Message({
      text,
      user: socket.user.id,
      room
    });

    await message.save();
    io.to(room).emit('newMessage', message);
    callback();
  } catch (err) {
    callback(err);
  }
});

socket.on('typing', ({ room, isTyping }) => {
  socket.broadcast.to(room).emit('typing', {
    user: socket.user.id,
    isTyping
  });
});

socket.on('disconnect', () => {
  console.log('Client disconnected');
});
});

return io;
};

module.exports = configureSocket;