var i2c = require('i2c-bus');
var sleep = require('sleep');
var GrovePi = require('node-grovepi').GrovePi;

var Commands = GrovePi.commands;
var Board = GrovePi.board;

//var I2CSensor = GrovePi.sensors.base.I2C

//var lcd_text = new I2CSensor(0x3e)
//var lcd_RGB = new I2CSensor(0x62)

var DISPLAY_RGB_ADDR = 0x62;
var DISPLAY_TEXT_ADDR = 0x3e;


module.exports = {
  setRGB : function(i2c1, r, g, b){
    i2c1.writeByteSync(DISPLAY_RGB_ADDR,0,0)
  	i2c1.writeByteSync(DISPLAY_RGB_ADDR,1,0)
  	i2c1.writeByteSync(DISPLAY_RGB_ADDR,0x08,0xaa)
  	i2c1.writeByteSync(DISPLAY_RGB_ADDR,4,r)
  	i2c1.writeByteSync(DISPLAY_RGB_ADDR,3,g)
  	i2c1.writeByteSync(DISPLAY_RGB_ADDR,2,b)
  },
  
  textCommand : function(i2c1, cmd){
	i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x80, cmd);
  },

  setText : function(i2c1, text){
	  textCommand(i2c1, 0x01) // clear display
  	sleep.usleep(50000);
  	textCommand(i2c1, 0x08 | 0x04) // display on, no cursor
  	textCommand(i2c1, 0x28) // 2 lines
  	sleep.usleep(50000);
  	var count = 0;
  	var row = 0;
  	for(var i = 0, len = text.length; i < len; i++) {
    	if(text[i] === "\n" || count === 16) {
      	count = 0;
      	row ++;
        	if(row === 2)
          	break;
      	textCommand(i2c1, 0xc0)
      	if(text[i] === "\n")
        	continue;
    	}
    	count++;
    	i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
  	}
  },
  setText_norefresh : function(i2c1, text){
    textCommand(i2c1, 0x02) // return home
    sleep.usleep(50000);
    textCommand(i2c1, 0x08 | 0x04) // display on, no cursor
    textCommand(i2c1, 0x28) // 2 lines
    sleep.usleep(50000);
    var count = 0;
    var row = 0;
    for(var i = 0, len = text.length; i < len; i++) {
      if(text[i] === "\n" || count === 16) {
        count = 0;
        row ++;
          if(row === 2)
            break;
        textCommand(i2c1, 0xc0)
        if(text[i] === "\n")
          continue;
      }
      count++;
      i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
    }
  },
  clear : function(i2c1){
    textCommand(i2c1, 0x01);
  }
};


/*
function setRGB(i2c1, r, g, b) {
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,0,0)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,1,0)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,0x08,0xaa)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,4,r)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,3,g)
  i2c1.writeByteSync(DISPLAY_RGB_ADDR,2,b)
}
*/

function textCommand(i2c1, cmd) {
  i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x80, cmd);
}
/*
function setText(i2c1, text) {
  textCommand(i2c1, 0x01) // clear display
  sleep.usleep(50000);
  textCommand(i2c1, 0x08 | 0x04) // display on, no cursor
  textCommand(i2c1, 0x28) // 2 lines
  sleep.usleep(50000);
  var count = 0;
  var row = 0;
  for(var i = 0, len = text.length; i < len; i++) {
    if(text[i] === "\n" || count === 16) {
      count = 0;
      row ++;
        if(row === 2)
          break;
      textCommand(i2c1, 0xc0)
      if(text[i] === "\n")
        continue;
    }
    count++;
    i2c1.writeByteSync(DISPLAY_TEXT_ADDR, 0x40, text[i].charCodeAt(0));
  }
}
*/
/*
var board = new Board({
    debug: true,
    onError: function(err) {
      console.log("Something wrong just happened")
      console.log(err)
    },
    onInit: function(res) {
      if (res) {
        console.log("GrovePi Version :: " + board.version())

        var i2c1 = i2c.openSync(1);
        setText(i2c1, "Memet is een\nEINDBAAS");
        setRGB(i2c1, 55, 55, 255);
        i2c1.closeSync();
      }
    }
  })
board.init();
*/