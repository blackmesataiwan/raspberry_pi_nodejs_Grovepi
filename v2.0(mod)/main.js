var QIoT = require('./QIoT');

var GrovePi = require('node-grovepi').GrovePi;
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
//var Piezo = new AnalogSensor(1);

var board = new Board();
board.init()

console.log("===============start=============");	

/*** 
	Setup QIoT Suite Lite connection.
***/

var Qclient = QIoT.qiotmqtt.start('./res/resourceinfo.json');


/*** 
	Send sensor's data to QIoT Suite Lite by Resourcetype.
***/

function sensors(){
	
	QIoT.qiotmqtt.type("Temperature",DHTSensor.read()[0],Qclient);
	QIoT.qiotmqtt.type("Humidity",DHTSensor.read()[1],Qclient);
	QIoT.qiotmqtt.type("Button",Button.read(),Qclient);
	QIoT.qiotmqtt.type("Touch",touch.read(),Qclient);
	QIoT.qiotmqtt.type("Sound",parseInt(Sound.read()/1023*100, 10),Qclient);
	QIoT.qiotmqtt.type("Rotary Angle",parseInt(Rotary.read()/1023*100, 10),Qclient);
	QIoT.qiotmqtt.type("Light",lightSensor.read(),Qclient);
	//QIoT.qiotmqtt.type("Piezo Vibration",parseInt(Piezo.read()/1023*100, 10),Qclient);

	setTimeout(function() {
		console.log("wating......");
		sensors();
	}, 100);
}
sensors();