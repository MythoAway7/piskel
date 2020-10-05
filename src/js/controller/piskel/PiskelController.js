(function () {
  var ns = $.namespace('pskl.controller.piskel');

  ns.PiskelController = function (piskel) {
    if (piskel) {
      this.setPiskel(piskel);
    } else {
      throw 'A piskel instance is mandatory for instanciating PiskelController';
    }
  };

  /**
   * Set the current piskel. Will reset the selected frame and layer unless specified
   * @param {Object} piskel
   * @param {Object} options:
   *                 preserveState {Boolean} if true, keep the selected frame and layer
   *                 noSnapshot {Boolean} if true, do not save a snapshot in the piskel
   *                            history for this call to setPiskel
   */
  ns.PiskelController.prototype.setPiskel = function (piskel, options) {
    this.piskel = piskel;
    options = options || {};
    if (!options.preserveState) {
      this.currentLayerIndex = 0;
      this.currentFrameIndex = 0;
    }

    this.layerIdCounter = 1;
  };

  ns.PiskelController.prototype.init = function () {
  };
  ns.PiskelController.prototype.socketIO = function() { //A function that is ran when socket.io connects. Most non drawing actions are done here.
    socket.on("createLayer", function (data) { //A client creates a layer.
      console.log('Layer from client.');
      var layer = new pskl.model.Layer(data.name); //make a new layer
      for (var i = 0 ; i < pskl.app.corePiskelController.getFrameCount() ; i++) {
        layer.addFrame(pskl.app.corePiskelController.createEmptyFrame_()); //Gets the right amount of frames.
      }
      pskl.app.corePiskelController.piskel.addLayerAt(layer, data.currentLayerIndex + 1); //Adds the layer at the index
      pskl.app.corePiskelController.setCurrentLayerIndex(data.currentLayerIndex); //Reselects the current layer. It was switching to the new layer.
      pskl.app.layersListController.renderLayerList_() //
    })

    socket.on("renameLayer", function (data) { //Renames the layer
      console.log(`A client has renamed a layer. Updating layer ${data.index} to ${data.name}`);
      var renamedLayer =  pskl.app.corePiskelController.getLayerByIndex(data.index);
      renamedLayer.setName(data.name);
      pskl.app.layersListController.renderLayerList_()
    })

    socket.on("clientOpacity", function (data) { //Changes the layers opacity. Per layer not the overrall setting.
      console.log(`A client has changed a layers opacity. Updating layer ${data.index} to ${data.opacity}`);
      var opacityLayer = pskl.app.corePiskelController.getLayerByIndex(data.index);
      opacityLayer.setOpacity(data.opacity);
      pskl.app.layersListController.renderLayerList_()
    })

    socket.on("clientLayerRemoval", function (data) { //Deletes a layer. 
      console.log(`A client has deleted layer ${data.index}`);
      pskl.app.corePiskelController.removeLayerAt(data.index)
      pskl.app.layersListController.renderLayerList_()
    })

    socket.on("clientDuplicateLayer", function (data) { //Duplicates a layer
      console.log(`A client has duplicated layer ${data.index}`);
      var layer = pskl.app.corePiskelController.getCurrentLayer()
      var clone = pskl.utils.LayerUtils.clone(layer);
      pskl.app.corePiskelController.piskel.addLayerAt(clone, data.index + 1)
      pskl.app.layersListController.renderLayerList_()
    })

    socket.on("clientMergeLayer", function (data) { //Merges a layer (always merges below)
      console.log(`Merging layer ${data.index} down.`);
      var layer = pskl.app.corePiskelController.getLayerByIndex(data.index);
      var downLayer = pskl.app.corePiskelController.getLayerByIndex(data.index - 1);
      var mergedLayer = pskl.utils.LayerUtils.mergeLayers(layer, downLayer);
      pskl.app.corePiskelController.removeLayerAt(data.index);
      pskl.app.corePiskelController.piskel.addLayerAt(mergedLayer, data.index);
      pskl.app.corePiskelController.removeLayerAt(data.index - 1);
      pskl.app.layersListController.renderLayerList_();
    })

    socket.on("clientLayerUp", function (data) { //Moves a layer up
      var layer = pskl.app.corePiskelController.getLayerByIndex(data.index); 
      pskl.app.corePiskelController.piskel.moveLayerUp(layer, data.toTop);
      pskl.app.layersListController.renderLayerList_();
    })

    socket.on("clientLayerDown", function (data) { //Moves a layer down.
      var layer = pskl.app.corePiskelController.getLayerByIndex(data.index); 
      pskl.app.corePiskelController.piskel.moveLayerDown(layer, data.toBottom);
      pskl.app.layersListController.renderLayerList_();
    })

//End of socket layers. Beginning of Frames

    socket.on("clientAddFrame", function (index) { //Moves a layer down.
      console.log('Adding client frames.')
      pskl.app.corePiskelController.getLayers().forEach(function (l) {
        l.addFrameAt(pskl.app.corePiskelController.createEmptyFrame_(), index);
      }.bind(pskl.app.corePiskelController));
      pskl.app.framesListController.renderDom()
    })

    socket.on("clientRemoveFrame", function (index) { //Moves a layer down.
      console.log('Removing client frames.')
      pskl.app.corePiskelController.getLayers().forEach(function (l) {
        l.removeFrameAt(index);
      });
      // Current frame index is impacted if the removed frame was before the current frame
      if (pskl.app.corePiskelController.currentFrameIndex >= index && pskl.app.corePiskelController.currentFrameIndex > 0) {
        pskl.app.corePiskelController.setCurrentFrameIndex(pskl.app.corePiskelController.currentFrameIndex - 1);}
      pskl.app.framesListController.renderDom()
    })

    socket.on("clientDuplicatingFrame", function (index) { //Moves a layer down.
      console.log('Duplicating client frames.');
      pskl.app.corePiskelController.getLayers().forEach(function (l) {
        l.duplicateFrameAt(index);
      });
      pskl.app.framesListController.renderDom()
    })

    socket.on("clientMovingFrame", function (data) { //Moves a layer down.
      console.log('Moving Client Frames.');
      var currentIndex = pskl.app.corePiskelController.getCurrentFrameIndex();
      pskl.app.corePiskelController.getLayers().forEach(function (l) {
        l.moveFrame(data.fromIndex, data.toIndex);
      });
      if (currentIndex == data.fromIndex) { //These statements move the current selected frame if needed since they are not linked as in normal piskel.
        console.log("The layer we were editing has moved! Fixing.");
        pskl.app.corePiskelController.setCurrentFrameIndex(data.toIndex);
      } else if (currentIndex == data.toIndex) {
        console.log("A frame is being moved to the current frame. Fixing.");
        pskl.app.corePiskelController.setCurrentFrameIndex(data.fromIndex);
      }
      pskl.app.framesListController.renderDom()
    })
    //End of Frame controls. Drawing begins



  }

  

  ns.PiskelController.prototype.getHeight = function () {
    return this.piskel.getHeight();
  };

  ns.PiskelController.prototype.getWidth = function () {
    return this.piskel.getWidth();
  };

  ns.PiskelController.prototype.getFPS = function () {
    return this.piskel.fps;
  };

  ns.PiskelController.prototype.setFPS = function (fps) {
    if (typeof fps !== 'number') {
      return;
    }
    this.piskel.fps = fps;
    $.publish(Events.FPS_CHANGED);
  };

  ns.PiskelController.prototype.getLayers = function () {
    return this.piskel.getLayers();
  };

  ns.PiskelController.prototype.getCurrentLayer = function () {
    return this.getLayerAt(this.currentLayerIndex);
  };

  ns.PiskelController.prototype.getLayerAt = function (index) {
    return this.piskel.getLayerAt(index);
  };

  ns.PiskelController.prototype.hasLayerAt = function (index) {
    return !!this.getLayerAt(index);
  };

  // FIXME ?? No added value compared to getLayerAt ??
  // Except normalizing to null if undefined ?? ==> To merge
  ns.PiskelController.prototype.getLayerByIndex = function (index) {
    var layers = this.getLayers();
    if (layers[index]) {
      return layers[index];
    } else {
      return null;
    }
  };

  ns.PiskelController.prototype.getCurrentFrame = function () {
    var layer = this.getCurrentLayer();
    return layer.getFrameAt(this.currentFrameIndex);
  };

  ns.PiskelController.prototype.getCurrentLayerIndex = function () {
    return this.currentLayerIndex;
  };

  ns.PiskelController.prototype.getCurrentFrameIndex = function () {
    return this.currentFrameIndex;
  };

  ns.PiskelController.prototype.getPiskel = function () {
    return this.piskel;
  };

  ns.PiskelController.prototype.isTransparent = function () {
    return this.getLayers().some(function (l) {
      return l.isTransparent();
    });
  };

  ns.PiskelController.prototype.renderFrameAt = function (index, preserveOpacity) {
    return pskl.utils.LayerUtils.flattenFrameAt(this.getLayers(), index, preserveOpacity);
  };

  ns.PiskelController.prototype.hasFrameAt = function (index) {
    return !!this.getCurrentLayer().getFrameAt(index);
  };

  ns.PiskelController.prototype.addFrame = function () {
    this.addFrameAt(this.getFrameCount());
  };

  ns.PiskelController.prototype.addFrameAtCurrentIndex = function () {
    this.addFrameAt(this.currentFrameIndex + 1);
  };

  ns.PiskelController.prototype.addFrameAt = function (index) { //I use this function to add frames.
    this.getLayers().forEach(function (l) {
      l.addFrameAt(this.createEmptyFrame_(), index);
      socket.emit("addFrameAt", index); //For every layer we have to replicate this. THe emit is also replicated.
    }.bind(this));

    this.setCurrentFrameIndex(index);
  };

  ns.PiskelController.prototype.createEmptyFrame_ = function () {
    var w = this.piskel.getWidth();
    var h = this.piskel.getHeight();
    return new pskl.model.Frame(w, h);
  };

  ns.PiskelController.prototype.removeFrameAt = function (index) {
    this.getLayers().forEach(function (l) {
      l.removeFrameAt(index);
      socket.emit("removeFrame", index);
    });
    // Current frame index is impacted if the removed frame was before the current frame
    if (this.currentFrameIndex >= index && this.currentFrameIndex > 0) {
      this.setCurrentFrameIndex(this.currentFrameIndex - 1);
    }
  };

  ns.PiskelController.prototype.duplicateCurrentFrame = function () {
    this.duplicateFrameAt(this.currentFrameIndex);
  };

  ns.PiskelController.prototype.duplicateFrameAt = function (index) {
    this.getLayers().forEach(function (l) {
      l.duplicateFrameAt(index);
      socket.emit("duplicateFrame", index);
    });
    this.setCurrentFrameIndex(index + 1);
  };

  ns.PiskelController.prototype.moveFrame = function (fromIndex, toIndex) {
    var data = {fromIndex: fromIndex, toIndex: toIndex};
    this.getLayers().forEach(function (l) {
      l.moveFrame(fromIndex, toIndex);
      socket.emit("moveFrame", data)
    });
  };

  ns.PiskelController.prototype.getFrameCount = function () {
    return this.piskel.getFrameCount();
  };

  ns.PiskelController.prototype.setCurrentFrameIndex = function (index) {
    if (this.hasFrameAt(index)) {
      this.currentFrameIndex = index;
      pskl.tools.drawing.theCurrentFrame = index;
    } else {
      window.console.error('Could not set current frame index to ' + index);
    }
  };

  ns.PiskelController.prototype.selectNextFrame = function () {
    var nextIndex = this.currentFrameIndex + 1;
    if (nextIndex < this.getFrameCount()) {
      this.setCurrentFrameIndex(nextIndex);
    }
  };

  ns.PiskelController.prototype.selectPreviousFrame = function () {
    var nextIndex = this.currentFrameIndex - 1;
    if (nextIndex >= 0) {
      this.setCurrentFrameIndex(nextIndex);
    }
  };

  ns.PiskelController.prototype.setCurrentLayerIndex = function (index) {
    console.log('Setting layer index to' + index);
    if (this.hasLayerAt(index)) {
      this.currentLayerIndex = index;
      pskl.tools.drawing.theCurrentLayer = index; //Notify the simple pen which layer we are on.
    } else {
      window.console.error('Could not set current layer index to ' + index);
    }
  };

  ns.PiskelController.prototype.selectLayer = function (layer) {
    var index = this.getLayers().indexOf(layer);
    if (index != -1) {
      this.setCurrentLayerIndex(index);
    }
  };

  ns.PiskelController.prototype.renameLayerAt = function (index, name) {
    console.log('Renaming')
    var layer = this.getLayerByIndex(index);
    if (layer) {
      layer.setName(name);
      var data = {index: index, name: name}
      socket.emit("layerName", data )
    }
  };

  ns.PiskelController.prototype.setLayerOpacityAt = function (index, opacity) {
    var layer = this.getLayerByIndex(index);
    if (layer) {
      layer.setOpacity(opacity);
      var data = {index: index, opacity: opacity};
      socket.emit("layerOpacity", data);
    }
  };

  ns.PiskelController.prototype.mergeDownLayerAt = function (index) {
    var layer = this.getLayerByIndex(index);
    var downLayer = this.getLayerByIndex(index - 1);
    if (layer && downLayer) {
      var mergedLayer = pskl.utils.LayerUtils.mergeLayers(layer, downLayer);
      this.removeLayerAt(index);
      this.piskel.addLayerAt(mergedLayer, index);
      this.removeLayerAt(index - 1);
      this.selectLayer(mergedLayer);
      var data = {index: index};
      socket.emit("mergeDownLayer", data)
    }
  };

  ns.PiskelController.prototype.generateLayerName_ = function () {
    var name = 'Layer ' + this.layerIdCounter;
    while (this.hasLayerForName_(name)) {
      this.layerIdCounter++;
      name = 'Layer ' + this.layerIdCounter;
    }
    return name;
  };

  ns.PiskelController.prototype.duplicateCurrentLayer = function () {
    var layer = this.getCurrentLayer();
    var clone = pskl.utils.LayerUtils.clone(layer);
    var currentLayerIndex = this.getCurrentLayerIndex();
    this.piskel.addLayerAt(clone, currentLayerIndex + 1);
    this.setCurrentLayerIndex(currentLayerIndex + 1);
    var data = {index: currentLayerIndex}
    socket.emit("duplicateLayer", data)
  };

  ns.PiskelController.prototype.createLayer = function (name) {
    console.log('Creating Layer');
    if (!name) {
      name = this.generateLayerName_(); //Step 1. Check for a name.
    }
    if (!this.hasLayerForName_(name)) {
      var layer = new pskl.model.Layer(name);
      for (var i = 0 ; i < this.getFrameCount() ; i++) {
        layer.addFrame(this.createEmptyFrame_()); //Frame counter. Adds the current amount.
      }
      var currentLayerIndex = this.getCurrentLayerIndex();
      this.piskel.addLayerAt(layer, currentLayerIndex + 1);
      this.setCurrentLayerIndex(currentLayerIndex + 1);
      var data = {name: name, frames2Make: i, currentLayerIndex: currentLayerIndex }
      socket.emit("layerCreation", data)
    } else {
      throw 'Layer name should be unique';
    }
  };

  ns.PiskelController.prototype.hasLayerForName_ = function (name) {
    return this.piskel.getLayersByName(name).length > 0;
  };

  ns.PiskelController.prototype.moveLayerUp = function (toTop) {
    var layer = this.getCurrentLayer();
    var index = this.getCurrentLayerIndex();
    this.piskel.moveLayerUp(layer, toTop);
    this.selectLayer(layer);
    console.log(index);
    var data = {layer: layer, toTop: toTop, index: index};
    socket.emit("moveLayerUp", data);
  };

  ns.PiskelController.prototype.moveLayerDown = function (toBottom) {
    var layer = this.getCurrentLayer();
    var index = this.getCurrentLayerIndex();
    this.piskel.moveLayerDown(layer, toBottom);
    this.selectLayer(layer);
    var data = {layer: layer, index: index, toBottom: toBottom};
    socket.emit("moveLayerDown", data);
  };

  ns.PiskelController.prototype.removeCurrentLayer = function () {
    var currentLayerIndex = this.getCurrentLayerIndex();
    this.removeLayerAt(currentLayerIndex);
    var data = {index: currentLayerIndex};
    socket.emit("removeLayer", data);
  };

  ns.PiskelController.prototype.removeLayerAt = function (index) {
    if (!this.hasLayerAt(index)) {
      return;
    }

    var layer = this.getLayerAt(index);
    this.piskel.removeLayer(layer);

    // Update the selected layer if needed.
    if (this.getCurrentLayerIndex() === index) {
      this.setCurrentLayerIndex(Math.max(0, index - 1));
    }
  };

  ns.PiskelController.prototype.serialize = function () {
    return pskl.utils.serialization.Serializer.serialize(this.piskel);
  };

  /**
   * Check if the current sprite is empty. Emptiness here means no pixel has been filled
   * on any layer or frame for the current sprite.
   */
  ns.PiskelController.prototype.isEmpty = function () {
    return pskl.app.currentColorsService.getCurrentColors().length === 0;
  };
})();

