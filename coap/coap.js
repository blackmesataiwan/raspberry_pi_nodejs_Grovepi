var QIoT = require('./QIoT');
var bl = require('bl');
var cp = require('child_process');

var Qclient = QIoT.qiotcoap.start('./res/resourceinfo.json');

/*** 
  Receive data of QIoT Suite Lite in other process.
***/

cp.fork('./observeCoAP.js');

/*** 
  Send sensor's data to QIoT Suite Lite by Resourcetype.
***/

//It's use "resourcetypename" to sending data.
//QIoT.qiotcoap.type("resourcetypename", value, Qclient);

function sensors(){
  QIoT.qiotcoap.type("Temperature",10,Qclient);
  setTimeout(function() {
    console.log("wating......");
    sensors();
  }, 100);
}
sensors();
