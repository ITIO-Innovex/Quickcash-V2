const fs = require('fs');
const path = require('path');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on('chatMessage', ({ orderId, message }) => {
      // 1. Log the message to a file based on orderId
      const logDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logMessage = `[${new Date().toISOString()}] (${socket.id}) ${message}\n`;
      fs.appendFileSync(path.join(logDir, `${orderId}.log`), logMessage);

      // 2. Broadcast the message to everyone except the sender
      socket.broadcast.emit(`chatMessage:${orderId}`, { message, sender: socket.id });

      // 3. Also send back a response to the sender for UI update (optional but consistent)
      socket.emit(`chatMessage:${orderId}`, { message, sender: 'me' });
    });

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
};
