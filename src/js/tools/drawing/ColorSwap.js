/**
 * @provide pskl.tools.drawing.ColorSwap
 *
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.ColorSwap = function() {
    this.toolId = 'tool-colorswap';
    this.helpText = 'Paint all pixels of the same color';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.COLORSWAP;

    this.tooltipDescriptors = [
      {key : 'ctrl', description : 'Apply to all layers'},
      {key : 'shift', description : 'Apply to all frames'}
    ];
  };

  pskl.utils.inherit(ns.ColorSwap, ns.BaseTool);

  /**
   * @override
   */
  ns.ColorSwap.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    if (frame.containsPixel(col, row)) {
      var oldColor = frame.getPixel(col, row);
      var newColor = this.getToolColor();

      var allLayers = pskl.utils.UserAgent.isMac ?  event.metaKey : event.ctrlKey;
      var allFrames = event.shiftKey;
      this.swapColors_(oldColor, newColor, allLayers, allFrames);

      this.raiseSaveStateEvent({
        allLayers : allLayers,
        allFrames : allFrames,
        oldColor : oldColor,
        newColor : newColor
      });
    }
  };

  ns.ColorSwap.prototype.replay = function (frame, replayData) {
    this.swapColors_(replayData.oldColor, replayData.newColor, replayData.allLayers, replayData.allFrames);
  };

  ns.ColorSwap.prototype.swapColors_ = function(oldColor, newColor, allLayers, allFrames) {
    var currentFrameIndex = pskl.app.piskelController.getCurrentFrameIndex();
    var layers = allLayers ? pskl.app.piskelController.getLayers() : [pskl.app.piskelController.getCurrentLayer()];
    var data = {oldColor: oldColor, newColor: newColor, allLayers: allLayers, allFrames: allFrames}
    socket.emit("colorSwap", data);
    layers.forEach(function (layer) {
      var frames = allFrames ? layer.getFrames() : [layer.getFrameAt(currentFrameIndex)];
      frames.forEach(function (frame) {
        this.applyToolOnFrame_(frame, oldColor, newColor, layer);
      }.bind(this));
    }.bind(this));
  };

  ns.ColorSwap.prototype.applyToolOnFrame_ = function (frame, oldColor, newColor) {
    oldColor = pskl.utils.colorToInt(oldColor);
    newColor = pskl.utils.colorToInt(newColor);
  /*  console.log("happening");
    console.log(frame)
    var data = {oldColor: oldColor, newColor: newColor, targetLayer: pskl.app.corePiskelController.getCurrentLayerIndex(), targetFrame: pskl.app.corePiskelController.getCurrentFrameIndex()}
    socket.emit("colorSwap", data);
    */
    frame.forEachPixel(function (color, col, row) {
      if (color !== null && color == oldColor) {
        frame.setPixel(col, row, newColor);
      }
    });
  };

  ns.ColorSwap.prototype.socketIO = function () {
    socket.on("colorSwapClient", function(data) {
      var oldColor = pskl.utils.colorToInt(data.oldColor);
      var newColor = pskl.utils.colorToInt(data.newColor);
      if (data.allLayers == true) { //Apply to all layers.
        var layers = pskl.app.piskelController.getLayers()
        layers.forEach(function (layer) {
          var frames = data.allFrames ? layer.getFrames() : [layer.getFrameAt(pskl.app.corePiskelController.getCurrentFrameIndex())];
          frames.forEach(function (frame) {
            frame.forEachPixel(function (color, col, row) {
              if (color !== null && color == oldColor) {
                frame.setPixel(col, row, newColor);
              }
            });
            
          })
          })
      } else {
        var layer = pskl.app.piskelController.getCurrentLayer();
          var frames = data.allFrames ? layer.getFrames() : [layer.getFrameAt(pskl.app.corePiskelController.getCurrentFrameIndex())];
          frames.forEach(function (frame) {
            frame.forEachPixel(function (color, col, row) {
              if (color !== null && color == oldColor) {
                frame.setPixel(col, row, newColor);
              }
          })
        

                

      })
    }
      /*
      pskl.app.corePiskelController.piskel.layers[`${data.targetLayer}`].frames[`${data.targetFrame}`].forEachPixel(function (color, col, row) {
        if (color !== null && color == data.oldColor) {
          pskl.app.corePiskelController.piskel.layers[`${data.targetLayer}`].frames[`${data.targetFrame}`].setPixel(col, row, data.newColor);
        }
        
     });
      */

    })
    console.log("Color Swap Socket is ready.")
  };
})();
