var userName = "";
var socket = {};
/*
var input = document.getElementById("connectInput");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("connectButton").click();
  }
});
*/
function theCallback() {
  if (connectionvalue == true) {
     document.getElementById("nameButton").hidden = false;
     document.getElementById("nameInput").hidden = false;
     document.getElementById("nameText").hidden = false;
     document.getElementById("dismissNotice").innerText = "Success! Server Connected"
  } else {
    document.getElementById("connectButton").style.outlineWidth = `3px`
    document.getElementById("connectButton").style.outlineColor = "#bf2222"
    document.getElementById("dismissNotice").innerText = "Failed to Connect. Make sure the server is running and the info is correct."
  }}

function serverHandle() {
  var connectionvalue = false;
  var serverAttempt = document.getElementById("connectInput").value;
  console.log(serverAttempt);
  start(serverAttempt);
}


function start(serverLocation, serverNumber) {
  console.log(`Attempting to connect to ${serverLocation}`);
  document.getElementById("dismissNotice").innerText = "Attempting to Connect..."
  socket = io(`ws://${serverLocation}`, {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttemps: 10,
  transports: ['websocket'],
  agent: false,
  upgrade: false,
  rejectUnauthorized: false
});

 setTimeout(() => { //Give it seven seconds to connect, send response after. Not determined by cnnt time
  if (socket.connected == false) {
    console.log("Connection failed.")
    connectionvalue = false
    socket.disconnect(); //Stop it from reconnecting. 
    theCallback()
  } else if (socket.connected == true) {
    console.log("Connection Succeeded");
    connectionvalue = true
    pskl.app.corePiskelController.socketIO() //Run all the socket event listeners. VIP
    theCallback()
  } else {
    console.log("Unknown error. Returning as failed.")
    console.log(socket.connected);
    connectionvalue = false
    theCallback()
  }
}, 7777);
}

function nameHandle() {
  var nameAttempt = document.getElementById("nameInput").value;
  console.log(nameAttempt);
  socket.emit("nameClaim", nameAttempt);
  console.log('made it')
  socket.on("successName", name => {
  console.log("Name was accepted.");
  document.getElementById("serverHead").style.background = "#31ab3a"
  document.getElementById("nameText").innerText = "The name was accepted. You can close this box now."
  });
  socket.on("retryName", name => {
  console.log("Name rejected. Try again");
  document.getElementById("serverHead").style.background = "#ab3131";
  document.getElementById("nameText").innerText = "That name is already taken. Please try again."
  })

}