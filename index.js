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

// Setting up authorization starts
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');

// Function to validate and decode the JWT
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Perform additional validation if needed
    return true;
  } catch (err) {
    return false;
  }
};
//setting up authorization ends


app.use(express());
app.use(cors());

//this stores user data
let clientDataArray = [];
let usersObj = {};
let currentQuestion;
let originalScoresData = [];
let queStartTime;


let getCurrentTime = () => {
  return new Date().getTime();
};

function calculateScore(correct, startTime, endTime) {
  //startTime - Record the start time when the user submits the answer
  //endTime - Record the end time after checking the answer
  const baseScore = 100;  // Points for a correct answer
  const timePenaltyRate = 5;  // Points deducted per second

  const timeTaken = (endTime - startTime) / 1000;  // Convert milliseconds to seconds
  const score = correct ? Math.max(0, baseScore - timePenaltyRate * timeTaken) : 0;

  return Math.floor(score);
}




io.on("connection", (socket) => {

  

  
  

    
    socket.on("new-user", (newUserData) => {
      usersObj[socket.id] = newUserData;

      newUserData.socketId = socket.id;
      
      let isPresent = false;
      if (clientDataArray.length === 0) {
        clientDataArray.push(newUserData);
        let data = {
          data: newUserData,
          usersList: clientDataArray,
        };
        io.emit("user-connected", data);
        io.emit("get-user", clientDataArray);
        io.emit("new-user-proceed" , data);
      }
      else
      {

        for (let i = 0; i < clientDataArray.length; i++) {
          if (newUserData.name === clientDataArray[i].name) {
            isPresent = true;
            break;
          }
        }
        if (!isPresent) {
          clientDataArray.push(newUserData);
          let data = {
            data: newUserData,
            usersList: clientDataArray,
          };
          io.emit("user-connected", data);
          io.emit("get-user", clientDataArray);
          io.emit("new-user-proceed" , data);
        }
        else
        {
          let data = {
            message : "Name already exist, please choose different name."
          }
          io.emit("new-user-error" , data);
        }
      }
      

      console.log(usersObj);
      console.log(clientDataArray);
  
      
  });

  //get current question
 socket.on("current-question", (questionsData)=>
 {
    currentQuestion = questionsData;
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
    io.emit("get-time" , data.questionOriginalTime);
    queStartTime = data.questionStartTime;
 })

 //get chart data for client
 socket.on("set-chart-data-client" , (data)=>
 {
  io.emit("get-chart-data-client" , data)
 })

 //get current answer
 socket.on("set-answer" , (data) =>
 {
  let startTime = data.time;
  let endTime;
  let score = 0;
  if(currentQuestion != undefined)
  {
    if(currentQuestion.Answer_Text__c === data.answer)
    {
      console.log("correct answer")
      //here we will emit changes to admin side for leaderboard list
      endTime = getCurrentTime();
      score = calculateScore(true , queStartTime, endTime);

    }
    else
    {
      endTime = getCurrentTime();
      score = calculateScore(false , startTime, endTime);
      console.log("Wrong answer")
    }

    if(clientDataArray != undefined)
    {
      for(let i=0; i<clientDataArray.length; i++)
      {
        if(clientDataArray[i].clientId === data.personObj.clientId)
        {
          clientDataArray[i].score += score;
        }
      }
      io.emit("get-user", clientDataArray);
    }
    
    console.log("Answer ");
    console.log(data)
    console.log(clientDataArray);
  }
  
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
        currentQuestion = null;
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

  
  /*
   Below code will contain the connected users data
   */
  // console.log("Socket data");
  // console.log(socket.id);
    
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

//setInterval(() => io.emit("hello" , "hello there"), 1000)

server.listen(PORT, () => {
    console.log("Server Started at port: " + PORT);
});


/* userObj example
{
    name: 'Prashant',
    passCode: 'adminPassCode',
    clientId: 'lowz6sgzoczjsb2qipd',
    isOnline: true,
    isReady: false,
    time: 1699884243107,
    score: 0,
    socketId: 'MgNGMx9IuKwyDYR_AAAD'
  }
  */