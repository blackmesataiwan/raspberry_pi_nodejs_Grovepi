console.log("Start test module");

var mqtt = require('mqtt');
var fs = require('fs');
var http = require('http');
var sleep = require('sleep');
// var rpio = require('rpio');
// var sensorLib = require("node-dht-sensor");
var Q = require('q');
var async = require('async');
//declare the path which cert infos locates.
var KEY = "";
var CERT = "";
var TRUSTED_CA_LIST = "";
var fakevalue = 0;


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


function getresourceinfo(fileName) {
        var defer = Q.defer();     
        var data = fs.readFileSync(fileName, 'utf8');

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
        var resourcedetail = data.resources;
        sensorslength = Object.keys(data.resources).length;
        for (var resourceidx in resourcedetail) {
            var jsonobj = {
                topic: resourcedetail[resourceidx].topic,
                resourceid: resourcedetail[resourceidx].resourceid,
                resourcetype: resourcedetail[resourceidx].resourcetypename,
                datatype: resourcedetail[resourceidx].datatype,
                unit: resourcedetail[resourceidx].unit,
            };
            resourceinfo.push(jsonobj);
        }
    
    return resourceinfo;
	}

function addsensors(resourcesinfo) {	
    var length = Object.keys(resourcesinfo).length;

    for(var i = 0; i < length; i++){
        var jsonobj = {
                
        name: 'Real' + i.toString(),
        id: resourcesinfo[i].resourceid,
        type: 22,
        pin: -1,
        topic: resourcesinfo[i].topic,
        resourcetype: resourcesinfo[i].resourcetype,
        value: 1
            
        };
            sensors.push(jsonobj);
    }
   	return sensors;
}

var mqttmessage = {
	send: function(){
	        if (typeof sensors != "undefined"){
	            for (var sensoridx in sensors) {
	                var topic_Pub = sensors[sensoridx].topic;
	                
	                var restype_name = sensors[sensoridx].resourcetype;
	                var qiot_value = sensors[sensoridx].value;


					Qclient.publish(topic_Pub, JSON.stringify({value: qiot_value}),  {qos:2,retain:true});
	            	console.log(" send message to [mqtt(s)://" + HOST + ":" + PORT + "], topic_Pub = " + topic_Pub + ", value = " + JSON.stringify({value: qiot_value}) + sensors[sensoridx].name);
	            }
	                     /*   
	            setTimeout(function() {
                	console.log("=========================================");
                	mqttmessage.send();
            	}, 1000);
            	*/

			}

		}
};


module.exports.qiotmqtt = {
		
	start: 	function (resourceinfofile){
				
				addsensors(getresourceinfo(resourceinfofile));
                Qclient = mqtt.connect(mqttoptions);
                Qclient.on('error', function(err) {
                    console.log("=========================================");
                    console.log("something wrong with mqtt service, err reason: " + err);
                    console.log("=========================================");
                });

                return Qclient;

			},
	id: 	function (id, value, Qsend){
                for (var sensoridx in sensors) {
                    if (id == sensors[sensoridx].id) {
                        sensors[sensoridx].value = value;

                        var topic_Pub = sensors[sensoridx].topic;
                        var qiot_value = sensors[sensoridx].value;

                        Qsend.publish(topic_Pub, JSON.stringify({value: qiot_value}),  {retain:true});
                        console.log(" send message to [mqtt(s)://" + HOST + ":" + PORT + "], topic_Pub = " + topic_Pub + ", value = " + JSON.stringify({value: qiot_value}) + sensors[sensoridx].name);
                    }
                    else{

                    }           
                }
		
			},
	type: 	function (restype_name, value, Qsend){  
                for (var sensoridx in sensors) {
                    if (restype_name == sensors[sensoridx].resourcetype) {
                        sensors[sensoridx].value = value;

                        var topic_Pub = sensors[sensoridx].topic;
                        var qiot_value = sensors[sensoridx].value;

                        Qsend.publish(topic_Pub, JSON.stringify({value: qiot_value}),  {retain:true});
                        console.log(" send message to [mqtt(s)://" + HOST + ":" + PORT + "], topic_Pub = " + topic_Pub + ", value = " + JSON.stringify({value: qiot_value}) + sensors[sensoridx].name);
                    }
                    else{

                    }           
                }
            },
    subscribeofid: function(id, Qreceive){
                    for (var sensoridx in sensors) {
                    if (id == sensors[sensoridx].id) {
                        //sensors[sensoridx].value = value;

                        var topic_Pub = sensors[sensoridx].topic;
                        //var qiot_value = sensors[sensoridx].value;

                        Qreceive.subscribe(sensors[sensoridx].topic);
                        console.log("add subscribe :" + sensors[sensoridx].topic)
                    }
                    else{

                    }           
                    }


    }
}