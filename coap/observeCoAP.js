var QIoT = require('./QIoT');
var bl = require('bl');

var Qclient = QIoT.qiotcoap.start('./res/resourceinfo.json');

/*** 
  Receive data of QIoT Suite Lite.
***/

//Setting Subscribe is use id <qiotcoap.subscribeofid("ID", Qclient);>
//It will return coap object
var req = QIoT.qiotcoap.subscribeofid("LED", Qclient)
req.on('response', function(res) {
  res.on('data', function(data) {
    var json = JSON.parse(data); 
    console.log(json.value);
    console.log("------------------------")
  })
})