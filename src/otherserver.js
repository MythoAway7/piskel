//Run this server BEFORE you run grunt play
//You run this by typing node otherserver.js in the proper directory


var app = require('express')(); //Website
var http = require('http').createServer(app); //Webstuff
var io = require('socket.io')(http); //websockets

//These handle the webserver. You can load the chat by itself here.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/chat.html'); //Give us the HTML page on request
});
app.get('/logo.png', (req, res) => {
  res.sendFile(__dirname + 'logo.png'); //Give us the HTML page on request
});
app.get('/serverList', (req, res) => {
  //use res for response
  console.log("A user requested the server list.");
  
});

var dataAvaible = true;



//handles the first sync
var newSync = io.of('/newSync');
newSync.on('connection', function(newSync) {
   console.log('someone connected');
   newSync.on('resyncRequest', (data) => {
    console.log('A user has requested a sync');
    if (dataAvaible == true) {
      newSync.emit('syncData', 'Hello everyone!');
    } else {
      //Make data avaible. If none is avaible we say -
      if("nodata" == "nodata") 
      newSync.emit('noData', "There is no data. You are the only active user!")
    }
    
 });
});



/*
io.on('connection', (socket) => { //Starts the basic server and chat.
  //Chat handling/initial setup. Little to do with piskel expect for names._____________________________
  socket.on("userJoin", nickname => { //Gives us their name once chosen.
    io.emit("welcomeMsg", nickname); //Sends a welcome message to 
    console.log(`${nickname} has joined.`)
  })

  socket.on('chat message', (msg) => { //Handles sending messages and recieving
    console.log(msg + "| sending to chat.") //The server logs it
    io.emit('chat message', msg); //Approved, sending to chat
  });


 //end of Chat setup/beginning__________________________________
 
  function resync() {
    //identify user.
    //send current state to user
    
  }
  
  function updateFrame() {

  }




  socket.on('penTool', (data) => {
     socket.broadcast.emit('penTool1', data);
     socket.broadcast.emit('frameUpdate',data)
   // io.emit('pen',theOverlay);
  });

  
/*
  socket.on('mouseMove', (coords) => { //Handles player position. NOT DRAWING.
    var newCoords = coords;
    newCoords.x = newCoords.x + 10; //Offsets so you don't click on the image. 
    newCoords.y = newCoords.y + 10;
    io.emit('updateCoords', newCoords); //Approved, sending to chat
  });
  
});
*/
//Server list. May add custom later
//var server1 = io.of('/server1');
var serverCount1 = 0 //Count of Clients
var serverList1 = ["serverListener","Serverhandler","ReadtheReadMeFile"]; //Array of users
var aNume = 0;
// Create more if needed.

io.on('connection', socket => {
    console.log("A client is connecting...");
    socket.emit("ping"); //ping pong
  socket.on("nameClaim", serverName => { //handles name claims per session. They are reset each session.
    console.log("trying to claim name");
    if (serverName == "Mytho") {console.log("Someone very special tried to join :)")} //:)
    for (i = 0; i < serverList1.length; i++) {
      if (serverList1[i] == serverName) { //The name exists already
        console.log('A user requested a name that has already been taken. Asking again...');
        socket.emit("retryName", ""); //Ask the user to retry
        break; //End the loop
      } else if (serverList1[i] !== serverName && i == serverList1.length - 1) { //new Name!
           serverList1.push(serverName); //Add the name to the array
           socket.emit("successName", "");// it worked
           console.log(`${serverName} has joined server 1.`); //Tell the server
           serverCount1 = serverCount1 + 1;
           break;
      }
    }
  });

  socket.on('penTool', (data) => { // pen data
    aNume = aNume + 1;
    console.log(aNume);
    data.pixels = data.pixels[`${data.pixels.length - 1}`];
    console.log(data);
   // socket.broadcast.emit('penTool1', data);
    socket.broadcast.emit('frameUpdate', data)
  });


  socket.on('penToolSmall', (data) => { // pen data
    aNume = aNume + 1;
    console.log(aNume);
    data.pixels = data.pixels[`${data.pixels.length - 1}`];
    console.log(data);
   // socket.broadcast.emit('penTool1', data);
    socket.broadcast.emit('penToolSmallClient', data)
  });


  socket.on('penToolMeduim', (data) => { // pen data
    aNume = aNume + 1;
    console.log(aNume);
    data.pixels = data.pixels[`${data.pixels.length - 1}`];
    console.log(data);
   // socket.broadcast.emit('penTool1', data);
    socket.broadcast.emit('penToolMeduimClient', data)
  });


  socket.on('penToolBig', (data) => { // pen data
    aNume = aNume + 1;
    console.log(aNume);
    data.pixels = data.pixels[`${data.pixels.length - 1}`];
    console.log(data);
   // socket.broadcast.emit('penTool1', data);
    socket.broadcast.emit('penToolBigClient', data)
  });


  socket.on('disconnecting', () => { //handles disconnects. The name will not be avaible.
  console.log("A user has disconnected.");
  serverCount1 = serverCount1 - 1;
  });

}) //End of server1







http.listen(3000, () => {
  console.log('Starting Server http://YOURLOCALIPADDRESS:3000');
  setTimeout(() => {
    console.log("Clients can start connecting.")
  }, 2000);
});