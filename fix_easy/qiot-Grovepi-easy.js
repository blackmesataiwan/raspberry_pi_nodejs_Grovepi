var mqtt = require('mqtt');
var fs = require('fs');
var http = require('http');
var sleep = require('sleep');
// var rpio = require('rpio');
// var sensorLib = require("node-dht-sensor");
var Q = require('q');
//declare the path which cert infos locates.
var KEY = "";
var CERT = "";
var TRUSTED_CA_LIST = "";
var fakevalue = 0;

//sensor

var GrovePi = require('node-grovepi').GrovePi;

var Commands = GrovePi.commands;
var Board = GrovePi.board;

var LightAnalogSensor = GrovePi.sensors.LightAnalog;
var DHTDigitalSensor = GrovePi.sensors.DHTDigital;
var DigitalSensor = GrovePi.sensors.base.Digital;
var AnalogSensor = GrovePi.sensors.base.Analog;

var lightSensor_value = 0;

var temperature_value = 0;
var humidity_value = 0;

var button_value = 0;
var touch_value = 0;
var Rotary_value = 0;
var Sound_value = 0;

var lightSensor = new LightAnalogSensor(2);
var DHTSensor = new DHTDigitalSensor(8);
var Button = new DigitalSensor(2);
var touch = new DigitalSensor(3);
var Rotary = new AnalogSensor(0);
var Sound = new AnalogSensor(1);

var board = new Board();



/*
var board = new Board({
    debug: true,
    onError: function(err) {
      console.log('Something wrong just happened')
      console.log(err)
    },
    onInit: function(res) {
      if (res) {
        console.log('GrovePi Version :: ' + board.version());

        var lightSensor = new LightAnalogSensor(2);
        var DHTSensor = new DHTDigitalSensor(8);
        var Button = new DigitalSensor(2);
        var touch = new DigitalSensor(3);
        var Rotary = new AnalogSensor(0);
        var Sound = new AnalogSensor(1);
        
        console.log('Sensor (start watch)');
        
         //light
        lightSensor.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != "false"){
                lightSensor_value = res;
                //console.log('Light onChange value=' + res + "\n");
            }
        })
        lightSensor.watch();
        
        //dht11
        DHTSensor.on('change', function(res) {
            if (typeof res[0] != "undefined" || typeof res[0] != "false"){
                
                temperature_value = res[0];
				humidity_value = res[1];

                //console.log('temperaturee onChange value=' + res[0] + "\n");
                //console.log('humidity onChange value=' + res[1] + "\n");
            }

        })
        DHTSensor.watch();
        
        //button
        Button.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != "false"){
                button_value = res;
                //console.log('Button onChange value=' + res + "\n");
            }
        })
        Button.watch();

        //touch
        touch.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != "false"){
                touch_value = res;
                //console.log('touch onChange value=' + res + "\n");   
            }
        })
        touch.watch();

        //Rotary
            Rotary.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != "false"){
                res = res/1023*100;
                res = res.toFixed(0);
                Rotary_value = res;
                //console.log('Rotary onChange value=' + res + "\n");   
            }
        })
        Rotary.watch();

        //Sound
            Sound.on('change', function(res) {
            if (typeof res != "undefined" || typeof res != "false"){
                res = res/1023*100;
                res = res.toFixed(0);
                Sound_value = res;
                //console.log('Sound onChange value=' + res + "\n");   
            }
        })
        Sound.watch();

      }
    }
  })
  */
board.init()

//declare mqtt server host & port infos
PORT = 8883;
HOST = '172.17.28.39';
USER_NAME = "";
USER_PASS = "";

//Device Info
CLIENT_ID = "";

var sensorslength = 0;

//for mqtt options, define mqtts options here
var mqttoptions = {
  // cmd: 'connect',
  clean: true, // or false,
  clientId: CLIENT_ID,
  protocol: 'mqtt',
  port: PORT,
  host: HOST,
  rejectUnauthorized : true,
  username: USER_NAME,
  password: USER_PASS,
  checkServerIdentity: function (host, cert) {
   return undefined;
  }
};

// Please declare below mqtt url and port as per your settings
var Qclient = null; //mqtt.connect(mqttoptions);

sensors = [];
resourceinfo = [];

/*
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
*/

function getresourceinfo(fileName) {
        var defer = Q.defer();
        fs.readFile(fileName,'utf8',function(err,data){
            if(!err && data) {
                data = JSON.parse(data);
                HOST = data.host[0];
                PORT = data.port;

                USER_NAME = data.username;
                USER_PASS = data.password;
                CLIENT_ID = data.clientId;

                /*Assginged new value to mqttoptions*/

                mqttoptions.clientId = CLIENT_ID;
                mqttoptions.port = PORT;
                mqttoptions.host = HOST;
                mqttoptions.username = USER_NAME;
                mqttoptions.password = USER_PASS;

                if(data.privateCert) { // mqtts
                    var key_o = data.privateCert;
                    var arr_KEY = key_o.split("/");
                    if(typeof arr_KEY !== "undefined"){
                        if(arr_KEY.length > 0){
                            var index = arr_KEY.length;
                            KEY = fs.readFileSync("./ssl/" + arr_KEY[index - 1].toString().trim());
                            console.log("privatekey full path = " + arr_KEY[index - 1].toString().trim());
                        }
                    }

                    var ca_o = data.caCert;
                    var arr_CA = ca_o.split("/");
                    if(typeof arr_CA !== "undefined"){
                        if(arr_CA.length > 0){
                            var index = arr_CA.length;
                            TRUSTED_CA_LIST = fs.readFileSync("./ssl/" + arr_CA[index - 1].toString().trim());
                        }
                    }

                    var cert_o = data.clientCert;
                    var arr_CERT = cert_o.split("/");
                    if(typeof arr_CERT !== "undefined"){
                        if(arr_CERT.length > 0){
                            var index = arr_CERT.length;
                            CERT = fs.readFileSync("./ssl/" + arr_CERT[index - 1].toString().trim());
                        }
                    }
                    mqttoptions.key = KEY;
                    mqttoptions.cert = CERT;
                    mqttoptions.ca = TRUSTED_CA_LIST;
                    mqttoptions.protocol = 'mqtts';
                } 
                /* End of Assginged new value to mqttoptions*/

                // Qclient.end(true);
                Qclient = mqtt.connect(mqttoptions);
                Qclient.on('error', function(err) {
                    console.log("=========================================");
                    console.log("something wrong with mqtt service, err reason: " + err);
                    console.log("=========================================");
                });
                var resourcedetail = data.resources;
                sensorslength = Object.keys(data.resources).length;
                for (var resourceidx in resourcedetail) {
                    var jsonobj = {

                        topic: resourcedetail[resourceidx].topic,
                        resourcetype: resourcedetail[resourceidx].resourcetypename,
                        datatype: resourcedetail[resourceidx].datatype,
                        unit: resourcedetail[resourceidx].unit,

                    };
                    resourceinfo.push(jsonobj);
                }
                defer.resolve(resourceinfo);
            }
        });
        return defer.promise;
}


/*

for QIoT Suite Lite connection

*/

var sensor = {
    read: function() {
        if (typeof sensors != "undefined")
        {
            for (var sensoridx in sensors) {
                var topic_Pub = sensors[sensoridx].topic;
                
                var restype_name = sensors[sensoridx].resourcetype;
                var qiot_value = 0;

                switch (restype_name){

                    case "Temperature" :
                        var res = DHTSensor.read()[0]
                        if (typeof res != "undefined" || "false"){
                            temperature_value = res;
                        }
                        qiot_value = temperature_value;
                        break;

                    case "Humidity" :
                        var res = DHTSensor.read()[1]
                        if (typeof res != "undefined" || "false"){
                            humidity_value = res;
                        }
                        qiot_value = humidity_value;
                        break;

                    case "Button" :
                        var res = Button.read()
                        if (typeof res != "undefined" || "false"){
                            button_value = res;
                        }
                        qiot_value = button_value;
                        break;

                    case "Touch" :
                        var res = touch.read()
                        if (typeof res != "undefined" || "false"){
                            touch_value = res;
                        }
                        qiot_value = touch_value;
                        break;

                    case "Sound" :
                        var res = Sound.read()
                        if (typeof res != "undefined" || "false"){
                            res = res/1023*100;
                            res = res.toFixed(0);
                            Sound_value = res;
                        }
                        qiot_value = Sound_value;
                        break;

                    case "Rotary Angle" :
                        var res = Rotary.read()
                        if (typeof res != "undefined" || "false"){
                            res = res/1023*100;
                            res = res.toFixed(0);
                            Rotary_value = res;
                        }
                        qiot_value = Rotary_value;
                        break;

                    case "Light" :
                        var res = lightSensor.read()
                        if (typeof res != "undefined" || "false"){
                            lightSensor_value = res;
                        }
                        qiot_value = lightSensor_value;
                        break;

                    default:
                        qiot_value = "undefined";
                        break;
                }
                

                Qclient.publish(topic_Pub, JSON.stringify({value: qiot_value}),  {retain:true});
                console.log(" send message to [mqtt(s)://" + HOST + ":" + PORT + "], topic_Pub = " + topic_Pub + ", value = " + JSON.stringify({value: qiot_value}) + sensors[sensoridx].name);
            }
            
            setTimeout(function() {
                console.log("=========================================");
                sensor.read();
            }, 0.5);
            
        }
    }
};

function addsensors(resourcesinfo) {

    var length = Object.keys(resourcesinfo).length;

    for(var i = 0; i < length; i++){
        var jsonobj = {
                
        name: 'Real' + i.toString(),
        type: 22,
        pin: -1,
        topic: resourcesinfo[i].topic,
        resourcetype: resourcesinfo[i].resourcetype
            
        };
            sensors.push(jsonobj);
    }
    return sensors;
}

getresourceinfo('./res/resourceinfo.json').then(function(res) {
    addsensors(res);
    sensor.read();
});

