//Run this server BEFORE you run grunt play
//You run this by typing node otherserver.js in the proper directory

const fs = require('fs'); //Server logging and state saving. (WIP)
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
var totalusers = 0;
var aNume = 0; //Logs total actions sent to server. 
var penSmall = 0; //Pensmall actions
var penSmallData = []; //pensmall data. We store up to 4 pixels and then wipe it.
var layerActions = 0;
var frameActions = 0;
var logs = {};
// Create more if needed.

io.on('connection', socket => {
    console.log('\x1b[36m%s\x1b[0m', "A client is connecting...");
    socket.emit("ping"); //ping pong
  socket.on("nameClaim", serverName => { //handles name claims per session. They are reset each session.
    console.log("A user is trying to claim a name.");
    if (serverName == "Mytho") {console.log("Someone very special tried to join :)")} //:)
    for (i = 0; i < serverList1.length; i++) {
      if (serverList1[i] == serverName) { //The name exists already
        console.log("\x1b[31m%s\x1b[0m", 'A user requested a name that has already been taken. Retrying...');
        socket.emit("retryName", ""); //Ask the user to retry
        break; //End the loop
      } else if (serverList1[i] !== serverName && i == serverList1.length - 1) { //new Name!
           serverList1.push(serverName); //Add the name to the array
           socket.emit("successName", "");// it worked
           console.log("\x1b[35m%s\x1b[0m",`${serverName} has joined server 1.`); //Tell the server
           serverCount1 = serverCount1 + 1;
           totalusers = totalusers + 1;
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
  //End of PenTool

  // Paint Bucket
  socket.on("paintBucket", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Paint Bucket used. ${data}`);
    socket.broadcast.emit("paintBucketClient", data);
  })

  //Stroke Tool
  socket.on("strokeTool", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Stroke Tool used. ${data}`);
    socket.broadcast.emit("strokeToolClient", data);
  })

  //Color Swap (Replace pixels with a color)
  socket.on("colorSwap", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Color swap used. ${data}`);
    socket.broadcast.emit("colorSwapClient", data);
  })

  //Dithering Tool
  socket.on("ditheringTool", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Dithering tool used. ${data.col, data.row, data.ditheringColor}`);
    socket.broadcast.emit("ditheringToolClient", data);
  })

  //Lighten and Darken Tool
  socket.on("contrastTool", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Dithering tool used. ${data.col, data.row}`);
    socket.broadcast.emit("contrastToolClient", data);
  })

  //Circle Tool
  socket.on("circleTool", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Circle tool used.`);
    socket.broadcast.emit("circleToolClient", data);
  })

  //Circle Tool
  socket.on("startCircle", (data) => {
    console.log("\x1b[33m%s\x1b[0m", `Updating Circle Start Coords`);
    socket.broadcast.emit("startCircleClient", data);
  })


//Start of layer events
  socket.on("addLayer", (layer) => {
    console.log("Building Piskel Layer");
    layerActions = layerActions + 1;
    socket.broadcast.emit("addLayerClient", layer);
  })



  socket.on("layerCreation", (data) => {
    console.log("A client has added a layer. Updating users.");
    layerActions = layerActions + 1;
    socket.broadcast.emit("createLayer", data);
  })



  socket.on("layerName", (data) => {
    console.log(`Layer ${data.index} is being renamed to ${data.name}`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("renameLayer", data);
  })



  socket.on("layerOpacity", (data) => {
    console.log(`Layer ${data.index} is now at ${data.opacity} opacity.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientOpacity", data);
  })


  socket.on("removeLayer", (data) => {
    console.log(`Layer ${data.index} is being deleted.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientLayerRemoval", data);
  })


  socket.on("duplicateLayer", (data) => {
    console.log(`Layer ${data.index} is being cloned.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientDuplicateLayer", data);
  })


  socket.on("mergeDownLayer", (data) => {
    console.log(`Layer ${data.index} is being merged with a layer below it.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientMergeLayer", data);
  })


  socket.on("moveLayerUp", (data) => {
    console.log(`${data.layer.name} is being moved up.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientLayerUp", data);
  })


  socket.on("moveLayerDown", (data) => {
    console.log(`${data.layer.name} is being moved down.`);
    layerActions = layerActions + 1;
    socket.broadcast.emit("clientLayerDown", data);
  })

//End of layer events. Beginning Frame events

  socket.on("addFrameAt", (index) => {
    console.log(`A frame is being added at index ${index}`);
    frameActions = frameActions + 1;
    socket.broadcast.emit("clientAddFrame", index);
  })

  socket.on("removeFrame", (index) => {
    console.log(`Frame ${index} is being removed.`);
    frameActions = frameActions + 1;
    socket.broadcast.emit("clientRemoveFrame", index);
  })

  socket.on("duplicateFrame", (index) => {
    console.log(`Frame ${index} is being duplicated.`);
    frameActions = frameActions + 1;
    socket.broadcast.emit("clientDuplicatingFrame", index);
  })

  socket.on("moveFrame", (data) => {
    console.log(`Frame ${data.fromIndex} is being moved to ${data.toIndex}`);
    frameActions = frameActions + 1;
    socket.broadcast.emit("clientMovingFrame", data);
  })


  socket.on('disconnecting', () => { //handles disconnects. The name will not be avaible.
  console.log("A user has disconnected.");
  serverCount1 = serverCount1 - 1;
  });

}) //End of server1


//Every 5 minutes we display server stats. Every 15 minutes we log data

setInterval(function(){
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  logs = {
    message: "These are updated every 15 minutes. These stats help me to identify usage for the average user.",
    frameActions: frameActions,
    layerActions: layerActions,
    pixelActions: aNume,
    activeUsers: serverList1,
    activeUserCount: serverCount1,
    totalUsers: totalusers,
    time: time
  }
  let data = JSON.stringify(logs)
  fs.writeFileSync('student-2.json', data);
}, 300000);

setInterval(function(){
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  logs = {
    message: "These are updated every 15 minutes. These stats help me to identify usage for the average user.",
    frameActions: frameActions,
    layerActions: layerActions,
    pixelActions: aNume,
    activeUsers: serverList1,
    activeUserCount: serverCount1,
    totalUsers: totalusers,
    time: time
  }
  let data = JSON.stringify(logs);
  console.log(data);
}, 150000);



http.listen(3000, () => {
  console.log('Starting Server http://YOURLOCALIPADDRESS:3000');
  setTimeout(() => {
    console.log('\x1b[36m%s\x1b[0m', "Clients can start connecting.");
  }, 2000);
});