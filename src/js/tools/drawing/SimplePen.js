
/**
 * @provide pskl.tools.drawing.SimplePen
 *
 * @require pskl.utils
 */
//NOTE> I refer to all incoming data as "client" and yourself as the host. Everyone runs the same script. 2 people= 2 hosts and 2 clients. It may be stange but I didn't see you volunteering to help/
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.SimplePen = function() {
    this.toolId = 'tool-pen';
    this.helpText = 'Pen tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.PEN;
    this.previousCol = null;
    this.previousRow = null;
    this.checkCol = null;
    this.checkRow = null;
    this.penSmall = [];
    this.penMeduim = [];
    this.penBig = [];
    this.pixels = [];
  };

  
  let checkClientRow = null;
  let checkClientCol = null;

  
  var theCurrentFrame;
  var theCurrentLayer;
  setTimeout(() => { //Marks the frame and layer as well as a progress indicator for loading.
    theCurrentFrame = pskl.app.corePiskelController.getCurrentFrameIndex(); //The index on the layer. They are in a set order unless moved. We use it to know which frame to draw to.
    pskl.app.corePiskelController.piskel.theCurrentFrame = theCurrentFrame
    theCurrentLayer = pskl.app.corePiskelController.getCurrentLayerIndex(); //Same thing but with layers instead of frames. 
    pskl.app.corePiskelController.piskel.theCurrentLayer = theCurrentLayer;
    pskl.app.corePiskelController.piskel.kindaDoneLoading = true;
    console.log('Done. Layer and Frame Indexed.' + `${theCurrentLayer} is the layer. ${theCurrentFrame} is the frame.`)
  }, 10000);
  

  pskl.utils.inherit(ns.SimplePen, ns.BaseTool);

  ns.SimplePen.prototype.supportsDynamicPenSize = function() {
    return true;
  };

  
  /**
   * @override
   */
  ns.SimplePen.prototype.applyToolAt = function(col, row, frame, overlay, event) {
   // console.log('applying tool');
    this.previousCol = col;
    this.previousRow = row;
    var color = this.getToolColor();
    this.drawUsingPenSize(color, col, row, frame, overlay);
  };

  ns.SimplePen.prototype.drawUsingPenSize = function(color, col, row, frame, overlay) {
    var penSize = pskl.app.penSizeService.getPenSize();
    var points = pskl.PixelUtils.resizePixel(col, row, penSize);
    if (penSize == 2) {
      points.forEach(function (point) {
        this.smallPen(color, point[0], point[1], frame, overlay);
      }.bind(this));
    } else {
       points.forEach(function (point) {
      this.draw(color, point[0], point[1], frame, overlay, penSize);
    }.bind(this));
    }
   
 //   console.log(points)
  };

  var beenThrough = false; //This lets us do the socket.on only once.
  var beenThroughSmall = false;
  var otherpixel = [] //We use this as a reference for what pixels the client has sent us.
  var clientColor;

  ns.SimplePen.prototype.draw = function(color, col, row, frame, overlay, penSize) {
     if (beenThrough !== true) {
      socket.on('frameUpdate', function(data) { //Drawing client sketch
        console.log('Placing Client Pixels');
       // frame.setPixel(data.pixels.col, data.pixels.row, data.color)
       pskl.app.corePiskelController.piskel.layers[`${pskl.app.corePiskelController.piskel.theCurrentLayer}`].frames[`${pskl.app.corePiskelController.piskel.theCurrentFrame}`].setPixel(data.pixels.col, data.pixels.row, data.color)
        /*
        var width = frame.width;
        var multiplier = data.pixels[i].row * width; //Y value times the width
        var realNumber = multiplier + data.pixels[i].col// plus the x
        console.log('Client pixel at ' + realNumber);
        clientColor = data.color
        clientColor = pskl.utils.colorToInt(clientColor);
        frame.pixels[realNumber] = clientColor;
        */
        checkClientRow = data.pixels.row;
        checkClientCol = data.pixels.col;
})
socket.on('penSmallData', function(data) { //Drawing client sketch
  console.log(data);
  frame.setPixel(data.pixels[0].col, data.pixels[0].row, data.color);
  frame.setPixel(data.pixels[1].col, data.pixels[1].row, data.color);
  frame.setPixel(data.pixels[2].col, data.pixels[2].row, data.color);
  frame.setPixel(data.pixels[3].col, data.pixels[3].row, data.color); 
})
} else {}
   

    overlay.setPixel(col, row, color); //Apply the pixel to the overlay. This does not actually do anything. We view it but it won't last.
    if (color === Constants.TRANSPARENT_COLOR) {
      frame.setPixel(col, row, color);//Handles transparent pixels. Possibly the eraser as it works from my changes.
   }
   
   if (this.checkCol == col && this.checkRow == row) {
 //    console.log('Duplicate from host.');
   } else {
     console.log(col, row)
      this.pixels.push({ //We use this later. THis does not actually apply the pixels to the frame, just a reference for what it will be.
      col : col,
      row : row,
      color : color
    });
      beenThrough = true;
     // console.log(this.pixels)
      
   //   var data = {pixels: this.pixels.slice(-1)[0], color: color} //A data packet with most of the required data. What we can't send we do there. Mainly anything that uses "this"
      switch (penSize) {
        case 1:
          var data = {pixels: this.pixels.slice(-1)[0], color: color};
          socket.emit('penTool', data); //When we release the tool send data to clients. 
          break;
        case 2:
          var data = {pixels: this.pixels.slice(-1)[0], color: color}
          socket.emit('penToolSmall', data); //When we release the tool send data to clients.
          this.penSmall = this.pixels;
          break;
        case 3:
          var data = {pixels: this.pixels.slice(-1)[0], color: color}
          socket.emit('penToolMeduim', data); //When we release the tool send data to clients.
          break;
        case 4:
          var data = {pixels: this.pixels.slice(-1)[0], color: color}
          socket.emit('penToolBig', data); //When we release the tool send data to clients. Track the order of pixels drawn, store it, and check it and remove when needed.
          break;
        default:
          break;
      } 

      this.checkRow = row; //These two statements we use to check if we are palcing duplicate pixels.
      this.checkCol = col;
  }

} // end of drawing


  /**
   * @override
   */
  ns.SimplePen.prototype.moveToolAt = function(col, row, frame, overlay, event) {
  //  console.log('moving tool');
    if ((Math.abs(col - this.previousCol) > 1) || (Math.abs(row - this.previousRow) > 1)) { //handle if more than one pixel is added quickly.
      // The pen movement is too fast for the mousemove frequency, there is a gap between the
      // current point and the previously drawn one.
      // We fill the gap by calculating missing dots (simple linear interpolation) and draw them.
      var interpolatedPixels = pskl.PixelUtils.getLinePixels(col, this.previousCol, row, this.previousRow);
      for (var i = 0, l = interpolatedPixels.length ; i < l ; i++) {
          var coords = interpolatedPixels[i];
          this.applyToolAt(coords.col, coords.row, frame, overlay, event);
          }
    } else { this.applyToolAt(col, row, frame, overlay, event); }

    this.previousCol = col;
    this.previousRow = row;
  };


ns.SimplePen.prototype.releaseToolAt = function(col, row, frame, overlay, event) {
  // apply on real frame
  this.setPixelsToFrame_(frame, this.pixels);

  // save state
  this.raiseSaveStateEvent({
    pixels : this.pixels.slice(0),
    color : this.getToolColor()
  });

  // reset
  this.penSmall = [];
  this.resetUsedPixels_();
};



ns.SimplePen.prototype.smallPen = function(color, col, row, frame, overlay, event) {
  var index = this.penSmall.findIndex(x => x.col==col && x.row==row); //Removes any duplicates
  if (index === -1){
    this.penSmall.push({
      col : col,
      row : row,
      color : color
    });
}
var data2 = {pixels: this.penSmall.slice(-1)[0], color: color};
console.log(data2);
this.setPixelsToFrame_(frame, this.penSmall);

socket.emit('penToolSmall', data2); //When we release the tool send data to clients.
this.resetUsedPixels_();
};


  ns.SimplePen.prototype.replay = function (frame, replayData) { //Handles ctrl+z (undo)
    this.setPixelsToFrame_(frame, replayData.pixels, replayData.color);
  };


  ns.SimplePen.prototype.setPixelsToFrame_ = function (frame, pixels, color) { //The normal method uses this to actaully draw the pixels. Frame
    pixels.forEach(function (pixel) {
      frame.setPixel(pixel.col, pixel.row, pixel.color);
    });
  };

  ns.SimplePen.prototype.resetUsedPixels_ = function() { //helps with undoing stuff
    this.pixels = [];
  };
  
})();