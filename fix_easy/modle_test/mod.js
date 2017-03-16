console.log("Start test module");

var mod_value_gl = 9999;


module.exports.sensor = {
		read: function(){
			var sensor_value = 8888;
			console.log(sensor_value + "\n");
			console.log(mod_value_gl + "\n");


		}

}





module.exports.say = function (str) {
        console.log(str);
}