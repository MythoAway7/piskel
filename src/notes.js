//THis is just for my reference, it doesn't do anything.

ns.Frame.prototype.setPixel = function (x, y, color) {
  //console.log('setting pixel')
      if (this.containsPixel(x, y)) {
        var index = y * this.width + x;
        var p = this.pixels[index];
        color = pskl.utils.colorToInt(color);
  
        if (p !== color) {
          this.pixels[index] = color || pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
          this.version++;
        }
      }
    };



      

  ns.SimplePen.prototype.frameSync = function(frame,pixels,color) { //We sync with all clients.
    //console.log(frame);
   // frame = pskl.tools.ToolsHelper.getTargetFrames()
   // console.log(ns.Frame)
   ns.Frame.prototype.frameSync(data.frame)
    pixels.forEach(function (pixel) {
      frame.setPixel(pixel.col, pixel.row, pixel.color);
      
     // console.log(1)
    });
isclient = false
  }
  


   /* socket.on('frameUpdate', function(data) { console.log('client is doing stuff');ns.SimplePen.prototype.frameSync(data)})*/
   ns.SimplePen.prototype.releaseToolAt = function(col, row, frame, overlay, event) { //Release tool. THis is where I handle client code.
    //  console.log('releasing');
      console.log(col,row);
        socket.on('frameUpdate', function(data) { //A client has drawn something
          console.log('client is doing stuff');
          for (let i = 0; i < otherpixel.length; i++) { //For every pixel we draw it. Keep in mind the pixel doesn't exist on the frame until now.
        //  console.log("otherpixel: " + otherpixel[i].col, otherpixel[i].row, otherpixel[i].color);
        
              var width = frame.width;
             var multiplier = otherpixel[i].row * width; //Y value times the width
             var realNumber = multiplier + otherpixel[i].col// plus the x
               console.log('Placing pixel at ' + realNumber + "coords:" + otherpixel[i].col, otherpixel[i].row, otherpixel[i].color);
              frame.pixels[realNumber] = 4280194607;
              console.log(`We are on ${i} and otherpixels is ${otherpixel.length}`)
          }
       //   isclient = true //We don't draw yet. When this is true it goes through an alt process and draws the client as well. Only after you draw after the client has drawn.
        })
    
    
    //Normal route
             if (isclient == true) { //Not true the first time
          console.log('Drawing Client')
          console.log("other pixel is this long: " + otherpixel.length);
        //  console.log('a');
          for (let i = 0; i < otherpixel.length; i++) { //For every pixel we draw it. Keep in mind the pixel doesn't exist on the frame until now.
          console.log("otherpixel: " + otherpixel[i].col, otherpixel[i].row, otherpixel[i].row);
         // var newrow = Math.floor(Math.random() * 10);
        //  var newcol = Math.floor(Math.random() * 10);
       //   console.log(newcol)
        //  frame.pixels[newcol] = 4278190080  
        var index = otherpixel[i].row * frame.width + otherpixel[i].col;
        var width = frame.width;
        var thenumber = otherpixel[i].col * width;
        var realNumber = thenumber + otherpixel[i].row
        console.log('index: ' + realNumber)
        frame.pixels[realNumber] = 4278190080
        // frame.setPixel(otherpixel[i].col, otherpixel[i].row, 4278190080); //WORK HERE (x,y,color)
          }/*
          otherpixel.forEach(function (pixel) {
          frame.pixels[33] = 4278190080;
          frame.setPixel(otherpixel[i],0,4278190080);
          //frame.setPixel(pixel.col, pixel.row, pixel.color);
          console.log(1)});
          */
          this.setPixelsToFrame_(frame, this.pixels); //Draws the pixels. Ours and the clients.
          isclient = false; //Set to default state.
      } 
      else
       {
          console.log('Drawing Host');
    
          this.setPixelsToFrame_(frame, this.pixels); //Draws our own work.
       }
    
    /*
       ns.SimplePen.prototype.lolpls = function() {
         console.log('The frame is')
         frame.pixels[3] = 4278190080;
       }
       */
    
        // save state
        this.raiseSaveStateEvent({
          pixels : this.pixels.slice(0),
          color : this.getToolColor()
        });
    
        
          var data = {col: col,row: row,frame: frame,overlay: overlay, pixels: this.pixels} //A data packet with most of the required data. What we can't send we do there. Mainly anything that uses "this"
           otherpixel = data.pixels
        //  console.log(otherpixel);
       socket.emit('penTool', data); //When we release the tool send data to clients. 
       this.resetUsedPixels_(); //Used for undoing actions. IDK how this works with clients yet.
      };







      //used for drawing on the overlay?
var isclient = false 
socket.on('pen', function(theOverlay){ //Wh
            
  ns.drawing.SimplePen.prototype.draw("#f31212",0,9,2,theOverlay)
            //On player position we show it.
          });




          /*
          socket.on('penTool1', function(data) {
  console.log(data.overlay);
  data.overlay.setPixels = function (x, y, color) {
  if (this.containsPixel(x, y)) {
    var index = y * this.width + x;
    var p = this.pixels[index];
    color = pskl.utils.colorToInt(color);

    if (p !== color) {
      this.pixels[index] = color || pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
      this.version++;
    }
  }
};
ns.drawing.SimplePen.prototype.applyToolAt(data.col,data.row,data.frame,data.overlay)
})*/


//idk

socket.on('test3', function(pixel) {
  console.log('it  happened');
  ns.drawing.SimplePen.prototype.setPixelsToFrame_ = function (frame, pixels, color) {
    console.log('in')
pixels.forEach(function (pixel) {
console.log('out')
frame.setPixel(pixel.col, pixel.row, pixel.color);

});
};
})


  /*
    setTimeout(myFunction2, 10000);  //If all is ready we do this to get the coords of the canvas. If its not ready we repeat till it is.
    function myFunction2() {
      try {
      document.getElementsByTagName("canvas").item(4).id = "YOURCANVAS"; //A canvas to ping location off of.
      } catch(e) {myFunction2()}
      var thecanvas = document.getElementById('YOURCANVAS');

    console.log(window.scrollY + document.querySelector('#YOURCANVAS').getBoundingClientRect().top); // Y

console.log(window.scrollX + document.querySelector('#YOURCANVAS').getBoundingClientRect().left) // X
    }*/


    $(document).mousemove(function(event){
      //  console.log("mouseMove", event.pageX + ", " + event.pageY);
      }); //Sends data to the server of player position.
/*
      socket.on('updateCoords', function(newCoords){ //When we recieve a chat message...
            theLogo.style.left = `${newCoords.x}px`;
            theLogo.style.top = `${newCoords.y}px`; 
            //On player position we show it.
          });
    */

/*
   <div id="dialog-container-wrapper" class="animated show">
   <div id="dialog-container" class="unsupported-browser">
 <div class="dialog-wrapper">
   <h3 class="dialog-head">
     Piskel Collorboration
     <span class="dialog-close">X</span>
   </h3>
   <div class="dialog-content clearfix">
     <p>This version of Piskel has been modified to allow multiple people to edit files at the same time</p>
       <p>If you do not want to sync with others, select (<span id="current-user-agent">Do not Sync</span>). If you want to collorborate select (<span id="current-user-agent">Sync</span>)</p>
       <p>This will require an active server. Full documentation how to set this up at (link)</p>
       <p>If you want to join a session select (<span id="current-user-agent">Sync</span>) and selece the (<span id="current-user-agent">Resync</span>) button on the right.</p>
       <p>Dismissing this box will start a normal session.</p>
       <button style="float: right;"><img src="/src/Link.png"></button>
       <button style="float: left;" id="SyncButton1"><img src="/src/Link.png"></button>
       <span style="float: right;padding-right: 5px;" id="current-user-agent">Do not Sync </span>
       <span style="float: left;padding-left: 5px;" id="current-user-agent"> Sync</span>
      

   </div>
 </div>
</div>
 </div>
 */