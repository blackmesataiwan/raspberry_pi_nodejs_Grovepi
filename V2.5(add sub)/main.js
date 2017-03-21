var QIoT = require('./QIoT');

var GrovePi = require('node-grovepi').GrovePi;
var Commands = GrovePi.commands;
var Board = GrovePi.board;

var DHTDigitalSensor = GrovePi.sensors.DHTDigital;
var DigitalSensor = GrovePi.sensors.base.Digital;
var AnalogSensor = GrovePi.sensors.base.Analog;


var DHTSensor = new DHTDigitalSensor(8);
    
//var Sound = new AnalogSensor(0);
var Rotary = new AnalogSensor(0);
var Piezo = new AnalogSensor(1);
var Light = new AnalogSensor(2);

var Button = new DigitalSensor(2);
var Touch = new DigitalSensor(3);

var LED = new DigitalSensor(4);

var board = new Board();
board.init();

var Qclient = QIoT.qiotmqtt.start('./res/resourceinfo.json');

/*** 
	Receive data of QIoT Suite Lite.
***/

//Setting Subscribe is use id <qiotmqtt.subscribeofid("ID", Qclient);>
//It will return topic name

var topic_LED = QIoT.qiotmqtt.subscribeofid("LED", Qclient);

//It's Switch case of topic name to receive message

Qclient.on('message', function(topic, message){
	var data = JSON.parse(message.toString());
	switch (topic){
		case topic_LED:
			if (data.value == 1) {
				LED.write(1);
			}
			else{
				LED.write(0);
			}
			break;

		default:
                
            break;
	}
	console.log(topic_LED);
	console.log(data.value);
	//LED.write(LED.read()?0:1);

});



/*** 
	Send sensor's data to QIoT Suite Lite by Resourcetype.
***/

//It's use "resourcetypename" to sending data.
//QIoT.qiotmqtt.type("resourcetypename", value, Qclient);


function sensors(){
	QIoT.qiotmqtt.type("Temperature",DHTSensor.read()[0],Qclient);
	QIoT.qiotmqtt.type("Humidity",DHTSensor.read()[1],Qclient);
	
	QIoT.qiotmqtt.type("Button",Button.read(),Qclient);
	QIoT.qiotmqtt.type("Touch",Touch.read(),Qclient);
	//QIoT.qiotmqtt.type("Sound",parseInt(Sound.read()/1023*100, 10),Qclient);
	QIoT.qiotmqtt.type("Rotary Angle",parseInt(Rotary.read()/1023*100, 10),Qclient);
	QIoT.qiotmqtt.type("Light",Light.read(),Qclient);
	QIoT.qiotmqtt.type("Piezo Vibration",Piezo.read()>100 ? 1:0,Qclient);

	setTimeout(function() {
		console.log("wating......");
		sensors();
	}, 100);
}
sensors();
