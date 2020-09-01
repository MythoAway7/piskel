
  //  console.log('drawing!');
   // var theOverlay = overlay;
   // console.log(theOverlay)
   // socket.emit('SimplePen', theOverlay)
  /* overlay.setPixel = function (x, y, color) { //I recreated overlay.setpixel. I had a good reason but I forgot what it was so...
    var index = y * this.width + x;
    var p = this.pixels[index];
    color = pskl.utils.colorToInt(color);

    if (p !== color) {
      this.pixels[index] = color || pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR);
      this.version++;}
};*/


/*
socket.on('aaaa', (data) => { //Handles sending messages and recieving
    console.log('lol')
    socket.broadcast.emit('doIT', data)
  });

   socket.on('anotherTest', (offset) => { //Handles sending messages and recieving
    console.log(offset)
  });