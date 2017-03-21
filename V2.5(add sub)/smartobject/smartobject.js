var SmartObject = require('smartobject'),
    QIoT = require('./QIoT'),
    GrovePi = require('node-grovepi').GrovePi;

var Commands = GrovePi.commands;
var Board = GrovePi.board;

var DHTDigitalSensor = GrovePi.sensors.DHTDigital;
var DigitalSensor = GrovePi.sensors.base.Digital;
var AnalogSensor = GrovePi.sensors.base.Analog;

// Add our led blink driver to hal
var board = new Board();


var sensor = new SmartObject({

    DHTSensor: new DHTDigitalSensor(8),
    
    //Sound: new AnalogSensor(0),
    Rotary: new AnalogSensor(0),
    Piezo: new AnalogSensor(1),
    Light: new AnalogSensor(2),

    Button: new DigitalSensor(2),
    Touch: new DigitalSensor(3),

    LED: new DigitalSensor(4),

}, function () {
    var self = this;
    board.init()
    /*
    this.hal.Button.dir(m.DIR_IN);
    this.hal.Touch.dir(m.DIR_IN);
    this.hal.LED.dir(m.DIR_OUT);  // set up direction for the button gpio
    */
});

// Analog Input (oid = 3202 or 'aIn')
function initsensor (){
    /*
    sensor.init('aIn', 0, {
    aInCurrValue: {                 // < rid = 5600, R, Float >
        read: function (cb) {
            var hal = this.parent.hal,
                value = parseInt(hal.Sound.read()/1023*100, 10);
            cb(null, value);
        }
    },
    // minMeaValue: ,               // < rid = 5601,  R, Float >
    // maxMeaValue: ,               // < rid = 5602,  R, Float >
    minRangeValue: 0,             // < rid = 5603,  R, Float >
    maxRangeValue: 100,             // < rid = 5604,  R, Float >
    // resetMinMaxMeaValues: ,      // < rid = 5605,  E, Opaque >
    // appType: ,                   // < rid = 5750, RW, String >
    sensorType: 'Sound'                 // < rid = 5751,  R, String >
    });
    */
    sensor.init('aIn', 1, {
        aInCurrValue: {                 // < rid = 5600, R, Float >
            read: function (cb) {
                var hal = this.parent.hal,
                    value = parseInt(hal.Rotary.read()/1023*100, 10);
                cb(null, value);
            }
        },
        // minMeaValue: ,               // < rid = 5601,  R, Float >
        // maxMeaValue: ,               // < rid = 5602,  R, Float >
        minRangeValue: 0,             // < rid = 5603,  R, Float >
        maxRangeValue: 100,             // < rid = 5604,  R, Float >
        // resetMinMaxMeaValues: ,      // < rid = 5605,  E, Opaque >
        // appType: ,                   // < rid = 5750, RW, String >
        sensorType: 'Rotary'                 // < rid = 5751,  R, String >
    });

    sensor.init('aIn', 2, {
        aInCurrValue: {                 // < rid = 5600, R, Float >
            read: function (cb) {
                var hal = this.parent.hal,
                    value = hal.Piezo.read()>100 ? 1:0;
                cb(null, value);
            }
        },
        // minMeaValue: ,               // < rid = 5601,  R, Float >
        // maxMeaValue: ,               // < rid = 5602,  R, Float >
        minRangeValue: 0,             // < rid = 5603,  R, Float >
        maxRangeValue: 100,             // < rid = 5604,  R, Float >
        // resetMinMaxMeaValues: ,      // < rid = 5605,  E, Opaque >
        // appType: ,                   // < rid = 5750, RW, String >
        sensorType: "Piezo Vibration"                 // < rid = 5751,  R, String >
    });

    sensor.init('aIn', 3, {
        aInCurrValue: {                 // < rid = 5600, R, Float >
            read: function (cb) {
                var hal = this.parent.hal,
                    value = hal.Light.read();
                cb(null, value);
            }
        },
        // minMeaValue: ,               // < rid = 5601,  R, Float >
        // maxMeaValue: ,               // < rid = 5602,  R, Float >
        // minRangeValue: ,             // < rid = 5603,  R, Float >
        // maxRangeValue: ,             // < rid = 5604,  R, Float >
        // resetMinMaxMeaValues: ,      // < rid = 5605,  E, Opaque >
        // appType: ,                   // < rid = 5750, RW, String >
        sensorType: 'Light'                 // < rid = 5751,  R, String >
    });

    sensor.init('dIn', 0, {
    dInState: {                     // < rid = 5500, R, Boolean >
        read: function (cb) {
            var hal = this.parent.hal,
                value = hal.Button.read();
                cb(null, value);
        }
    },
    // counter: ,                   // < rid = 5501,  R, Integer >
    // dInPolarity: ,               // < rid = 5502, RW, Boolean >
    // debouncePeriod: ,            // < rid = 5503, RW, Integer, ms >
    // edgeSelection: ,             // < rid = 5504, RW, Integer { 1: fall, 2: rise, 3: both } >
    // counterReset: ,              // < rid = 5505,  E, Opaque >
    // appType: ,                   // < rid = 5750, RW, String >
    sensorType: "Button"                 // < rid = 5751,  R, String >
    });

    sensor.init('dIn', 1, {
    dInState: {                     // < rid = 5500, R, Boolean >
        read: function (cb) {
            var hal = this.parent.hal,
                value = hal.Button.read();
                cb(null, value);
        }
    },
    // counter: ,                   // < rid = 5501,  R, Integer >
    // dInPolarity: ,               // < rid = 5502, RW, Boolean >
    // debouncePeriod: ,            // < rid = 5503, RW, Integer, ms >
    // edgeSelection: ,             // < rid = 5504, RW, Integer { 1: fall, 2: rise, 3: both } >
    // counterReset: ,              // < rid = 5505,  E, Opaque >
    // appType: ,                   // < rid = 5750, RW, String >
    sensorType: "Touch"                 // < rid = 5751,  R, String >
    });

    sensor.init('dOut', 0, {
    dOutState: {                    // < rid = 5550, RW, Boolean >
        read: function (cb) {
            var hal = this.parent.hal,
            value = hal.LED.read();
            cb(null, value);
        },
        write: function (value, cb) {
            var hal = this.parent.hal
            hal.LED.write(value);
            cb(null, value);
        }
    },
    // dOutpolarity: ,              // < rid = 5551, RW, Boolean { 0: normal, 1: reversed } >
    // appType:                     // < rid = 5750, RW, String >
    });
/*
    sensor.init('temperature', 0, {
    sensorValue: {                  // < rid = 5700, R, Float >
        read: function (cb) {
            var hal = this.parent.hal,
                    value = hal.Temperature.read();
                    value =(1/(Math.log(((1023-value)*10000/value)/10000)/3975+1/298.15)-273.15).toFixed(2);
                cb(null, value);
        }
    },
    units: "C",                     // < rid = 5701, R, String >
    // minMeaValue: ,               // < rid = 5601, R, Float >
    // maxMeaValue: ,               // < rid = 5602, R, Float >
    // minRangeValue: ,             // < rid = 5603, R, Float >
    // maxRangeValue: ,             // < rid = 5604, R, Float >
    // resetMinMaxMeaValues:        // < rid = 5605, E, Opaque >
    sensorType: "Temperature"
    });
*/
}

var Qclient = QIoT.qiotmqtt.start('./res/resourceinfo.json');

var topic_LED = QIoT.qiotmqtt.subscribeofid("LED", Qclient);

Qclient.on('message', function(topic, message){
    var data = JSON.parse(message.toString());
    switch (topic){
        case topic_LED:
            if (data.value == 1) {
                sensor.write('dOut', 0, 'dOutState', 1);
            }
            else{
                sensor.write('dOut', 0, 'dOutState', 0);
            }
            break;

        default:
                
            break;
    }
    console.log(topic_LED);
    console.log(data.value);
    //LED.write(LED.read()?0:1);

});

function senddata (oid,iid,rid){
    var sensortype = sensor.get(oid, iid, 'sensorType');
    sensor.read(oid, iid, rid, function (err, data) {
    if (!err)
        QIoT.qiotmqtt.type(sensortype,data,Qclient);
    });
}

function teansdata(){

    //senddata('temperature', 0, 'sensorValue');
    senddata('aIn', 0, 'aInCurrValue');
    senddata('aIn', 1, 'aInCurrValue');
    senddata('aIn', 2, 'aInCurrValue');
    senddata('aIn', 3, 'aInCurrValue');

    senddata('dIn', 0, 'dInState');
    senddata('dIn', 1, 'dInState');

    setTimeout(function() {
        console.log("wating......");
        teansdata();
    }, 100);
}
initsensor();
teansdata();