/**
 * @provide pskl.tools.drawing.Circle
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');
 //This has been modified (more so than the normal tools)
 //I had to pull functions from the shapetool file for performance reasons.The orignal functions on this file are still used for the local player.
 //The client is sent the starting coordinates of the circle whenever the mosue is clicked by the host.
 //When the mouse is released we send the last 2 coordinates and have the getcirclepixels_ function do the math to calculate the missing coordinates between.
 //Finally, we draw the circle.
  ns.Circle = function() {
    ns.ShapeTool.call(this);

    this.toolId = 'tool-circle';
    this.helpText = 'Circle tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.CIRCLE;
    this.startColClient = null;
    this.startRowClient = null;
  };

  pskl.utils.inherit(ns.Circle, ns.ShapeTool);

  /**
   * @override
   */
  ns.Circle.prototype.draw = function (col, row, color, targetFrame, penSize) { //The host runs this locally. Ran on mouse movement
    this.getCirclePixels_(this.startCol, this.startRow, col, row, penSize).forEach(function (point) {
      targetFrame.setPixel(point[0], point[1], color);
    });
  };

  ns.Circle.prototype.drawClient = function (col, row, color, penSize, targetFrame, layer) { //The client uses this to draw.
    pskl.tools.drawing.Circle.prototype.getCirclePixels_(pskl.tools.drawing.Circle.startColClient, pskl.tools.drawing.Circle.startRowClient, col, row, penSize).forEach(function (point) {
      pskl.app.corePiskelController.piskel.layers[`${layer}`].frames[`${targetFrame}`].setPixel(point[0], point[1], color)
    });
  };

  ns.Circle.prototype.applyToolAt = function(col, row, frame, overlay, event) { //Ran when the tool is clicked. Sends clients the start of the circle
    $.publish(Events.DRAG_START, [col, row]);
    this.startCol = col;
    this.startRow = row;
    var penSize = pskl.app.penSizeService.getPenSize();
    this.draw(col, row, this.getToolColor(), overlay, penSize);
    var data = {col, row}
    socket.emit("startCircle", data);
  };

  ns.ShapeTool.prototype.moveToolAt = function(col, row, frame, overlay, event) { //Ran when the tool is moved. I had to use this for the host. Maybe not. IDK. or care.
    var coords = this.getCoordinates_(col, row, event);
    $.publish(Events.CURSOR_MOVED, [coords.col, coords.row]);

    overlay.clear();
    var color = this.getToolColor();
    if (color == Constants.TRANSPARENT_COLOR) {
      color = Constants.SELECTION_TRANSPARENT_COLOR;
    }

    // draw in overlay
    var penSize = pskl.app.penSizeService.getPenSize();
    this.draw(coords.col, coords.row, color, overlay, penSize);
  };

  ns.Circle.prototype.getCirclePixels_ = function (x0, y0, x1, y1, penSize) { //A complex math formula for getting the circle with 4 points. 2 are from the client ending the click and 2 are from starting the click.

    var coords = pskl.PixelUtils.getOrderedRectangleCoordinates(x0, y0, x1, y1);
    var pixels = [];
    var xC = Math.round((coords.x0 + coords.x1) / 2);
    var yC = Math.round((coords.y0 + coords.y1) / 2);
    var evenX = (coords.x0 + coords.x1) % 2;
    var evenY = (coords.y0 + coords.y1) % 2;
    var rX = coords.x1 - xC;
    var rY = coords.y1 - yC;

    var x;
    var y;
    var angle;
    var r;

    if (penSize == 1) {
      for (x = coords.x0 ; x <= xC ; x++) {
        angle = Math.acos((x - xC) / rX);
        y = Math.round(rY * Math.sin(angle) + yC);
        pixels.push([x - evenX, y]);
        pixels.push([x - evenX, 2 * yC - y - evenY]);
        pixels.push([2 * xC - x, y]);
        pixels.push([2 * xC - x, 2 * yC - y - evenY]);
      }
      for (y = coords.y0 ; y <= yC ; y++) {
        angle = Math.asin((y - yC) / rY);
        x = Math.round(rX * Math.cos(angle) + xC);
        pixels.push([x, y - evenY]);
        pixels.push([2 * xC - x - evenX, y - evenY]);
        pixels.push([x, 2 * yC - y]);
        pixels.push([2 * xC - x - evenX, 2 * yC - y]);
      }
      return pixels;
    }

    var iX = rX - penSize;
    var iY = rY - penSize;
    if (iX < 0) {
      iX = 0;
    }
    if (iY < 0) {
      iY = 0;
    }

    for (x = 0 ; x <= rX ; x++) {
      for (y = 0 ; y <= rY ; y++) {
        angle = Math.atan(y / x);
        r = Math.sqrt(x * x + y * y);
        if ((rX <= penSize || rY <= penSize ||
          r > iX * iY / Math.sqrt(iY * iY * Math.pow(Math.cos(angle), 2) + iX * iX * Math.pow(Math.sin(angle), 2)) +
          0.5) &&
          r < rX * rY / Math.sqrt(rY * rY * Math.pow(Math.cos(angle), 2) + rX * rX * Math.pow(Math.sin(angle), 2)) +
          0.5) {
          pixels.push([xC + x, yC + y]);
          pixels.push([xC - x - evenX, yC + y]);
          pixels.push([xC + x, yC - y - evenY]);
          pixels.push([xC - x - evenX, yC - y - evenY]);
        }
      }
    }

    return pixels;
  };
  ns.Circle.prototype.releaseToolAt = function(col, row, frame, overlay, event) { //Rn when mouse is released. Sends the client the last 2 coords
    overlay.clear();
    var coords = this.getCoordinates_(col, row, event);
    var color = this.getToolColor();
    var penSize = pskl.app.penSizeService.getPenSize();
    this.draw(coords.col, coords.row, color, frame, penSize);

    $.publish(Events.DRAG_END);
    this.raiseSaveStateEvent({
      col : coords.col,
      row : coords.row,
      startCol : this.startCol,
      startRow : this.startRow,
      color : color,
      penSize : penSize
    });
    var data = {coords: coords, penSize: penSize, targetFrame: pskl.app.corePiskelController.getCurrentFrameIndex(), layer: pskl.app.corePiskelController.getCurrentLayerIndex(), color: color};
    socket.emit("circleTool", data);
  };

  ns.Circle.prototype.socketIO = function() {
    socket.on("circleToolClient", function(data) { //Draws the circle
      pskl.tools.drawing.Circle.prototype.drawClient(data.coords.col, data.coords.row, data.color, data.penSize, data.targetFrame, data.layer);
  })

  socket.on("startCircleClient", function(data) { //updates the starting coords for the circle
    console.log('Updating Circle starting coords');
    pskl.tools.drawing.Circle.startColClient = data.col;
    pskl.tools.drawing.Circle.startRowClient = data.row;
})
  console.log("Circle Socket Ready.");
  };
})();
