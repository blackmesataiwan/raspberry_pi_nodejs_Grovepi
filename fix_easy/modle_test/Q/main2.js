var QIoT = require('./QIoT');

var GrovePi = require('node-grovepi').GrovePi;
var Q = require('q');
var async = require('async');
var Commands = GrovePi.commands;
var Board = GrovePi.board;

var LightAnalogSensor = GrovePi.sensors.LightAnalog;
var DHTDigitalSensor = GrovePi.sensors.DHTDigital;
var DigitalSensor = GrovePi.sensors.base.Digital;
var AnalogSensor = GrovePi.sensors.base.Analog;

var lightSensor = new LightAnalogSensor(2);
var DHTSensor = new DHTDigitalSensor(8);
var Button = new DigitalSensor(2);
var touch = new DigitalSensor(3);
var Rotary = new AnalogSensor(0);
var Sound = new AnalogSensor(1);

var board = new Board();
board.init()




var deferred = Q.defer();
console.log("===============start=============");	

QIoT.qiotmqtt.start('./res/resourceinfo.json');
async.parallel(
    function() {
    	
    }
);
async.parallel(
    function() {
    	while (1){
    		QIoT.qiotmqtt.type("Temperature",DHTSensor.read()[0]);
			QIoT.qiotmqtt.type("Humidity",DHTSensor.read()[1]);
			QIoT.qiotmqtt.type("Button",Button.read());
			QIoT.qiotmqtt.type("Touch",touch.read());

			QIoT.qiotmqtt.type("Sound",parseInt(Sound.read()/1023*100, 10));
			QIoT.qiotmqtt.type("Rotary Angle",parseInt(Rotary.read()/1023*100, 10));
			QIoT.qiotmqtt.type("Light",lightSensor.read());
			console.log("===============SE=============");
    	}
	    	
    }
);




/*
function sensors() {
  console.log("===============SF=============");	
	
	QIoT.qiotmqtt.type("Temperature",DHTSensor.read()[0]);
	QIoT.qiotmqtt.type("Humidity",DHTSensor.read()[1]);
	QIoT.qiotmqtt.type("Button",Button.read());
	QIoT.qiotmqtt.type("Touch",touch.read());

	QIoT.qiotmqtt.type("Sound",parseInt(Sound.read()/1023*100, 10));
	QIoT.qiotmqtt.type("Rotary Angle",parseInt(Rotary.read()/1023*100, 10));
	QIoT.qiotmqtt.type("Light",lightSensor.read());
	console.log("===============SE=============");	
	
	sensors();
	console.log("===============SSSSSSSS=============");	
	
	setTimeout(function() {
		console.log("wating......");
		sensors();
	}, 0.5);
	
	
};
sensors();
*/
/*
start().then(function()　{
  console.log("===============sensors=============");
  //process.nextTick(sensors);
  sensors();
});
*/
console.log("===============END=============");	