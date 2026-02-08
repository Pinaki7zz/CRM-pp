const { Server } = require('socket.io');

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });
    
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('join-chat', (chatId) => {
        socket.join(chatId);
      });
      
      socket.on('send-message', (data) => {
        socket.to(data.chatId).emit('new-message', data);
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
}

module.exports = SocketHandler;
