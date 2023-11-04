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

//this stores user data
let clientDataArray = [];
let usersObj = {};


io.on("connection", (socket) => {
  
  /*
   Below code will contain the connected users data
   */
  // console.log("Socket data");
  // console.log(socket.id);
    socket.on("new-user", (newUserData) => {
        usersObj[socket.id] = newUserData;
        
        let isPresent = false;
        if (clientDataArray.length === 0) {
          clientDataArray.push(newUserData);
        }
        for (let i = 0; i < clientDataArray.length; i++) {
          if (newUserData.name === clientDataArray[i].name) {
            isPresent = true;
          }
        }
        if (!isPresent) {
          clientDataArray.push(newUserData);
        }

        console.log(usersObj);
        console.log(clientDataArray);
    
        let data = {
          data: newUserData,
          usersList: clientDataArray,
        };
        io.emit("user-connected", data);
        io.emit("get-user", clientDataArray);
    });
  
   socket.on("current-question", (questionsData)=>
   {
      console.log(questionsData)
      io.emit("get-current-question" , questionsData);
   })

   socket.on("isQuiz-start" , (data)=>
   {
    console.log("Data from Admin side" , data);
    io.emit("quiz-start-bool" , data);
   })

   socket.on("set-time", (data)=>
   {
      //format of the data is time in seconds
      console.log("Test Original timings are", data)
      io.emit("get-time" , data);
   })

   
  //  socket.on("current-user" , (userData)=>
  //  {
  //   console.log(userData);
  //  })

    console.log("Client connected!")

    socket.on("reset-test", ()=>
    {
      //clear everything
      clientDataArray = [];
      usersObj = {};
      io.emit("get-user", clientDataArray);
      console.log("Data cleared");
      // console.log(clientDataArray);
      // console.log(usersObj);
    })
    
  
    socket.on("disconnect", () => {
      if(usersObj != undefined && clientDataArray.length != 0)
      {
        try
        {
          clientDataArray = clientDataArray.filter(
            (item) => usersObj[socket.id].name !== item.name
          );
          setTimeout(() => {
            delete usersObj[socket.id];
          }, 2000);
          io.emit("get-user", clientDataArray);
        }
        catch(e)
        {
          console.log(e);
        }
        
      }
      
      console.log("User Disconnected");
      // let disconnectObj = { name: usersObj[socket.id].name, time: getCurrentTime() };
      // io.emit("show-disconnect", disconnectObj);
      // io.emit("user-disconnected", clientArray);
      
    });
  });

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

//setInterval(() => io.emit("hello" , "hello there"), 1000)

server.listen(PORT, () => {
    console.log("Server Started at port: " + PORT);
});