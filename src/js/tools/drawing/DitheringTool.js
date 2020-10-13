/**
 * @provide pskl.tools.drawing.DitheringTool
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');

  ns.DitheringTool = function() {
    ns.SimplePen.call(this);
    this.toolId = 'tool-dithering';
    this.helpText = 'Dithering tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.DITHERING;
  };

  pskl.utils.inherit(ns.DitheringTool, ns.SimplePen);

  ns.DitheringTool.prototype.supportsDynamicPenSize = function() {
    return true;
  };

  /**
   * @override
   */
  ns.DitheringTool.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    this.previousCol = col;
    this.previousRow = row;

    var penSize = pskl.app.penSizeService.getPenSize();
    var points = pskl.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(function (point) {
      this.applyToolOnPixel(point[0], point[1], frame, overlay, event);
    }.bind(this));
  };

  ns.DitheringTool.prototype.applyToolOnPixel = function(col, row, frame, overlay, event) {
    var usePrimaryColor = (col + row) % 2;

    if (pskl.app.mouseStateService.isRightButtonPressed()) {
      usePrimaryColor = !usePrimaryColor;
    }

    var ditheringColor = usePrimaryColor ?
      pskl.app.selectedColorsService.getPrimaryColor() :
      pskl.app.selectedColorsService.getSecondaryColor();

    this.draw(ditheringColor, col, row, frame, overlay);
    var data = {color: ditheringColor, col: col, row: row, frame: pskl.app.corePiskelController.getCurrentFrameIndex(), layer: pskl.app.corePiskelController.getCurrentLayerIndex()};
    socket.emit("ditheringTool", data);
  };

  ns.DitheringTool.prototype.socketIO = function() {
    socket.on("ditheringToolClient", function(data) {
      pskl.tools.drawing.DitheringTool.prototype.dither(data.color, data.col, data.row, data.frame, data.layer) //We dither from the simplePen file instead of here.
    })
    console.log("Dithering Socket ready.")
  };

})();
