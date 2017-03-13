var mqtt = require('mqtt');
var fs = require('fs');
var http = require('http');
// var rpio = require('rpio');
// var sensorLib = require("node-dht-sensor");
var Q = require('q');
var lcd = require('./lcd.js');
var i2c = require('i2c-bus');
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
var DHTDigitalSensor = GrovePi.sensors.DHTDigital

var lightSensor_value = 0;
var i2c1 = i2c.openSync(1);

lcd.clear(i2c1);

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
        console.log('Light Analog Sensor (start watch)');
        lightSensor.on('change', function(res) {
        	lightSensor_value = -10230/(-10-res);

        	//lcd.setText(i2c1, "light is :\n" + lightSensor_value);
        	//lcd.setText(i2c1, "Memet is een\nEINDBAAS");
        	//lcd.setRGB(i2c1, 55, 55, 255);
        	//i2c1.closeSync();

        	
          	//console.log('Light onChange value=' + res);
        })
        lightSensor.watch();

      }
    }
  })
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
                    var jsonobj = {topic: resourcedetail[resourceidx].topic};
                    resourceinfo.push(jsonobj);
                }
                defer.resolve(resourceinfo);
            }
        });
        return defer.promise;
}

var sensor = {
    read: function() {
        if (typeof sensors != "undefined")
        {
            for (var sensoridx in sensors) {
                var topic_Pub = sensors[sensoridx].topic;
                //var temperature = 0;
                var light = lightSensor_value.toFixed(0);

                // if (sensoridx == 0){
                //     var DHTinfo =  sensorLib.read(sensors[sensoridx].type, sensors[sensoridx].pin);
                //     temperature = parseInt(DHTinfo.temperature.toFixed(0));
                // }
                // else{
                //     temperature = getRandomInt(0,50);
                // }
                //temperature = getRandomInt(0,50);
                Qclient.publish(topic_Pub, JSON.stringify({value: light}),  {retain:true});
                console.log(" send message to [mqtt(s)://" + HOST + ":" + PORT + "], topic_Pub = " + topic_Pub + ", value = " + JSON.stringify({value: light}));
                try{
                    lcd.setText_norefresh(i2c1, "light is :\n");
                    //lcd.setText_norefresh(i2c1, "\n               ");
                    lcd.setText_norefresh(i2c1, "\n" + light + "               ");
                    lcd.setRGB(i2c1, 55, 55, 255);
                } catch(err){
                    console.log("i2c err");
                }
                
            }
            setTimeout(function() {
                console.log("=========================================");
                sensor.read();
            }, 1000);
        }
    }
};

getresourceinfo('./res/resourceinfo.json').then(function(res) {
    addsensors(res);
    sensor.read();
});

function addsensors(resourcesinfo) {

    var length = Object.keys(resourcesinfo).length;

    for(var i = 0; i < length; i++){
        if( i == 0)
        {
            //real
            var jsonobj = {name: 'Rajah-RPI-DHT11-1-Office', type: 11, pin: 4,topic: resourcesinfo[i].topic};
            sensors.push(jsonobj);
        }
        else
        {
            //fake
            var jsonobj = {name: 'Fake' + i.toString(), type: 22, pin: -1, topic: resourcesinfo[i].topic};
            sensors.push(jsonobj);
        }
    }
    return sensors;
}
