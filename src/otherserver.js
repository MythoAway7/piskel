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
var aNume = 0; //Logs total actions sent to server. 
var penSmall = 0; //Pensmall actions
var penSmallData = []; //pensmall data. We store up to 4 pixels and then wipe it.
// Create more if needed.

io.on('connection', socket => {
    console.log("A client is connecting...");
    socket.emit("ping"); //ping pong
  socket.on("nameClaim", serverName => { //handles name claims per session. They are reset each session.
    console.log("A user is trying to claim a name.");
    if (serverName == "Mytho") {console.log("Someone very special tried to join :)")} //:)
    for (i = 0; i < serverList1.length; i++) {
      if (serverList1[i] == serverName) { //The name exists already
        console.log('A user requested a name that has already been taken. Retrying...');
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
   // data.pixels = data.pixels[`${data.pixels.length - 1}`];
    console.log(data);
   // socket.broadcast.emit('penTool1', data);
    socket.broadcast.emit('frameUpdate', data)
  });


  socket.on('penToolSmall', (data) => { // pen data
    aNume = aNume + 1;
    penSmall = penSmall + 1; //Caps at 4
    console.log(penSmall);
    penSmallData.push({
      col : data.pixels.col,
      row : data.pixels.row,
      color : data.color
    });
    // data.pixels = data.pixels[`${data.pixels.length - 1}`];
    if (penSmall == 4) { //Send it sets of 4 pixels.
      penSmall = 0;
      data.pixels = penSmallData
      penSmallData = [];
      socket.broadcast.emit('penSmallData', data)
      
    } else {
     console.log('nothing')
    }
    console.log(data);
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


//Start of layer events
  socket.on("addLayer", (layer) => {
    console.log("Building Piskel Layer");
    socket.broadcast.emit("addLayerClient", layer);
  })



  socket.on("layerCreation", (data) => {
    console.log("A client has added a layer. Updating users.");
    socket.broadcast.emit("createLayer", data);
  })



  socket.on("layerName", (data) => {
    console.log(`Layer ${data.index} is being renamed to ${data.name}`);
    socket.broadcast.emit("renameLayer", data);
  })



  socket.on("layerOpacity", (data) => {
    console.log(`Layer ${data.index} is now at ${data.opacity} opacity.`);
    socket.broadcast.emit("clientOpacity", data);
  })


  socket.on("removeLayer", (data) => {
    console.log(`Layer ${data.index} is being deleted.`);
    socket.broadcast.emit("clientLayerRemoval", data);
  })


  socket.on("duplicateLayer", (data) => {
    console.log(`Layer ${data.index} is being cloned.`);
    socket.broadcast.emit("clientDuplicateLayer", data);
  })


  socket.on("mergeDownLayer", (data) => {
    console.log(`Layer ${data.index} is being merged with a layer below it.`);
    socket.broadcast.emit("clientMergeLayer", data);
  })


  socket.on("moveLayerUp", (data) => {
    console.log(`${data.layer.name} is being moved up.`);
    socket.broadcast.emit("clientLayerUp", data);
  })


  socket.on("moveLayerDown", (data) => {
    console.log(`${data.layer.name} is being moved down.`);
    socket.broadcast.emit("clientLayerDown", data);
  })

//End of layer events. Beginning Frame events

  socket.on("addFrameAt", (index) => {
    console.log(`A frame is being added at index ${index}`);
    socket.broadcast.emit("clientAddFrame", index);
  })

  socket.on("removeFrame", (index) => {
    console.log(`Frame ${index} is being removed.`);
    socket.broadcast.emit("clientRemoveFrame", index);
  })

  socket.on("duplicateFrame", (index) => {
    console.log(`Frame ${index} is being duplicated.`);
    socket.broadcast.emit("clientDuplicatingFrame", index);
  })

  socket.on("moveFrame", (data) => {
    console.log(`Frame ${data.fromIndex} is being moved to ${data.toIndex}`);
    socket.broadcast.emit("clientMovingFrame", data);
  })


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