
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
    this.pixels = [];
  };

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
  //  console.log('drawing using pen size');
    var penSize = pskl.app.penSizeService.getPenSize();
    var points = pskl.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(function (point) {
      this.draw(color, point[0], point[1], frame, overlay);
    }.bind(this));
  };
  var otherpixel = [] //We use this as a reference for what pixels the client has sent us.
var clientColor;
  ns.SimplePen.prototype.draw = function(color, col, row, frame, overlay) { 
    
socket.on('frameUpdate', function(data) { //A client has drawn something
  console.log('Placing Client Pixels');
  for (let i = 0; i < data.pixels.length; i++) { //For every pixel we draw it. Keep in mind the pixel doesn't exist on the frame until now.
//  console.log("otherpixel: " + otherpixel[i].col, otherpixel[i].row, otherpixel[i].color);

      var width = frame.width;
     var multiplier = data.pixels[i].row * width; //Y value times the width
     var realNumber = multiplier + data.pixels[i].col// plus the x
       console.log('Placing pixel at ' + realNumber);
       clientColor = data.color
       clientColor = pskl.utils.colorToInt(clientColor);
      frame.pixels[realNumber] = clientColor;
      console.log(`We are ${i} times through.`)
  }
//   isclient = true //We don't draw yet. When this is true it goes through an alt process and draws the client as well. Only after you draw after the client has drawn.
})


    overlay.setPixel(col, row, color); //Apply the pixel to the overlay. This does not actually do anything. We view it but it won't last.
    if (color === Constants.TRANSPARENT_COLOR) {
      frame.setPixel(col, row, color);//This actually does stuff. Now it stays.
    }
    

   this.pixels.push({ //We use this later. THis does not actually apply the pixels to the frame, just a reference for what it will be.
      col : col,
      row : row,
      color : color
    });
    var data = {pixels: this.pixels, color: color} //A data packet with most of the required data. What we can't send we do there. Mainly anything that uses "this"
     socket.emit('penTool', data); //When we release the tool send data to clients. 
}
  //[{col : col,
 // row : row,
//  color : color
//}];


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
  this.resetUsedPixels_();
};


  ns.SimplePen.prototype.replay = function (frame, replayData) { //Handles ctrl+z (undo)
    this.setPixelsToFrame_(frame, replayData.pixels, replayData.color);
  };


  ns.SimplePen.prototype.setPixelsToFrame_ = function (frame, pixels, color) { //The normal method uses this to actaully draw the pixels. Frame
    pixels.forEach(function (pixel) {
      frame.setPixel(pixel.col, pixel.row, pixel.color);
      
      console.log('ending!')
    });
    
  };

  ns.SimplePen.prototype.resetUsedPixels_ = function() { //helps with undoing stuff
    this.pixels = [];
    console.log('done')
  };
})();