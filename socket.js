// socket.js

const socketIo = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = socketIo(httpServer);

  io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle new messages
    socket.on('newMessage', (message) => {
      // Emit the message to all connected sockets
      io.emit('message', message);
    });

    // Handle message read
    socket.on('messageRead', (messageId) => {
      // Emit status update to all connected sockets
      io.emit('messageStatusUpdate', { messageId, status: 'read' });
    });

    // Handle user online status
    socket.on('userOnline', (userId) => {
      // Emit status update to all connected sockets
      io.emit('userStatusUpdate', { userId, online: true });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
};
