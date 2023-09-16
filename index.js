'use strict';

// const express = require('express');
// const socketIO = require('socket.io');
// let cors = require("cors");
// app.use(cors());


const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
//const io = require("socket.io")(server);
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});
require("dotenv").config();
const PORT = process.env.PORT || 8282;

app.use(express());
app.use(cors());






// const server = express()
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));

// const io = socketIO(server);

// io.on('connection', (socket) => {
//   console.log('Client connected');

//   socket.on('disconnect', () => console.log('Client disconnected'));
//   socket.on("hello", ()=> console.log("User says hello"));
// //   socket.on("time", ()=> {
// //     setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
// //   })
// });

// setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

io.on("connection", (socket) => {
    /*socket.on("new-user", (newUserData) => {
      users[socket.id] = newUserData;
      let isPresent = false;
      if (clientArray.length === 0) {
        clientArray.push(newUserData);
      }
      for (let i = 0; i < clientArray.length; i++) {
        if (newUserData.name === clientArray[i].name) {
          isPresent = true;
        }
      }
      if (!isPresent) {
        clientArray.push(newUserData);
      }
  
      let data = {
        data: newUserData,
        usersList: clientArray,
      };
      io.emit("user-connected", data);
      io.emit("user-count", clientArray);
    });*/
  
    // let data = { id: socket.id };
    // socket.emit("set_id", data);
    // socket.on("send_message", (body) => {
    //   io.emit("message", body);
    // });

    // socket.on("time", ()=>
    // {
    //     io.emit()
    // })

    console.log("Client connected!")
  
    socket.on("disconnect", () => {
    //   clientArray = clientArray.filter(
    //     (item) => users[socket.id].name !== item.name
    //   );
      console.log("User Disconnected");
    //   let disconnectObj = { name: users[socket.id].name, time: getCurrentTime() };
    //   io.emit("show-disconnect", disconnectObj);
    //   io.emit("user-disconnected", clientArray);
    //   setTimeout(() => {
    //     delete users[socket.id];
    //   }, 2000);
    });
  });

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

server.listen(PORT, () => {
    console.log("Server Started at port: " + PORT);
});