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

        console.log('Light Analog Sensor (start watch)')

        //light
        lightSensor.on('change', function(res) {
          console.log('Light onChange value=' + res + "\n");
        })
        lightSensor.watch()
        
        //dht11
        DHTSensor.on('change', function(res) {
            console.log('temperaturee onChange value=' + res[0] + "\n");
            console.log('humidity onChange value=' + res[1] + "\n");
            temperature_value = res[0];
            humidity_value = res[1];
        })
        DHTSensor.watch()
        
        //button
        Button.on('change', function(res) {
            console.log('Button onChange value=' + res + "\n");
        })
        Button.watch()

        //touch
        touch.on('change', function(res) {
            console.log('touch onChange value=' + res + "\n");
        })
        touch.watch()
      }
    }
  })
board.init()