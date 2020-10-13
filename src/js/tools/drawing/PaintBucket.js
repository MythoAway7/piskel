/**
 * @provide pskl.tools.drawing.PaintBucket
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.PaintBucket = function() {
    this.toolId = 'tool-paint-bucket';
    this.helpText = 'Paint bucket tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.PAINT_BUCKET;
  };

  pskl.utils.inherit(ns.PaintBucket, ns.BaseTool);

  /**
   * @override
   */
  ns.PaintBucket.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    var color = this.getToolColor();
    pskl.PixelUtils.paintSimilarConnectedPixelsFromFrame(frame, col, row, color);
    var data = {layerIndex: pskl.app.corePiskelController.getCurrentLayerIndex() , frameIndex: pskl.app.corePiskelController.getCurrentFrameIndex(), col: col, row: row, color: color};
    socket.emit("paintBucket", data);
    this.raiseSaveStateEvent({
      col : col,
      row : row,
      color : color
    });
  };

  ns.PaintBucket.prototype.replay = function (frame, replayData) {
    pskl.PixelUtils.paintSimilarConnectedPixelsFromFrame(frame, replayData.col, replayData.row, replayData.color);
  };

  ns.PaintBucket.prototype.socketIO = function () {
    socket.on("paintBucketClient", function(data) {
      console.log("Paint bucket tool used by client.");
      pskl.PixelUtils.paintSimilarConnectedPixelsFromFrame(pskl.app.corePiskelController.piskel.layers[`${data.layerIndex}`].frames[`${data.frameIndex}`], data.col, data.row, data.color);
    })
     console.log("Paint Bucket socket is ready.");
  };
})();
