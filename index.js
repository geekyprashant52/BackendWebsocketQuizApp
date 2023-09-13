'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on("hello", ()=> console.log("User says hello"));
//   socket.on("time", ()=> {
//     setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
//   })
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);