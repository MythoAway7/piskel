//Run this server BEFORE you run grunt play
//You run this by typing node otherserver.js
//Use a split terminal 
var app = require('express')(); //Website
var http = require('http').createServer(app); //Webstuff
var io = require('socket.io')(http); //websockets

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat.html'); //Give us the HTML page on request
});

io.on('connection', (socket) => { //Once connected...
  socket.on("userJoin", nickname => { //Gives us their name once chosen.
    io.emit("welcomeMsg", nickname); //Sends a welcome message to 
    console.log(`${nickname} has joined.`)
  })

  socket.on('chat message', (msg) => { //Handles sending messages and recieving
    console.log(msg + "| sending to chat.") //The server logs it
    io.emit('chat message', msg); //Approved, sending to chat
  });
});


http.listen(3000, () => {
  console.log('Starting Server *:3000');
});