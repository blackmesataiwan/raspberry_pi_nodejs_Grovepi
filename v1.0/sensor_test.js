var GrovePi = require('node-grovepi').GrovePi

var Commands = GrovePi.commands
var Board = GrovePi.board

var LightAnalogSensor = GrovePi.sensors.LightAnalog;
var DHTDigitalSensor = GrovePi.sensors.DHTDigital;
var DigitalSensor = GrovePi.sensors.base.Digital;
var AnalogSensor = GrovePi.sensors.base.Analog;

var board = new Board({
    debug: true,
    onError: function(err) {
      console.log('Something wrong just happened')
      console.log(err)
    },
    onInit: function(res) {
      if (res) {
        console.log('GrovePi Version :: ' + board.version())

        var lightSensor = new LightAnalogSensor(2);
        var DHTSensor = new DHTDigitalSensor(8);
        var Button = new DigitalSensor(2);
        var touch = new DigitalSensor(3);
        var Rotary = new AnalogSensor(0);
        var Sound = new AnalogSensor(1);

        console.log('Light Analog Sensor (start watch)')

        //light
        lightSensor.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != false){
                console.log('Light onChange value=' + res + "\n");
            }
        })
        lightSensor.watch();
        
        //dht11
        DHTSensor.on('change', function(res) {
            if (typeof res[0] != "undefined" || typeof res[0] != false){
                console.log('temperaturee onChange value=' + res[0] + "\n");
                console.log('humidity onChange value=' + res[1] + "\n");
            }

        })
        DHTSensor.watch();
        
        //button
        Button.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != false){
                console.log('Button onChange value=' + res + "\n");
            }
        })
        Button.watch();

        //touch
        touch.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != false){
                console.log('touch onChange value=' + res + "\n");   
            }
        })
        touch.watch();

        //Rotary
            Rotary.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != false){
                res = res/1023*100;
                res = res.toFixed(0);
                console.log('Rotary onChange value=' + res + "\n");   
            }
        })
        Rotary.watch();

        //Sound
            Sound.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != false){
                res = res/1023*100;
                res = res.toFixed(0);
                console.log('Sound onChange value=' + res + "\n");   
            }
        })
        Sound.watch();
      }
    }
  })
board.init();