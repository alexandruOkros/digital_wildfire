// Converter Class.
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var converter2 = new Converter({});
var converter3 = new Converter({});
var converter4 = new Converter({});

// The data.
// var data = "imported_data_from_super = [";
 
//end_parsed will be emitted once parsing finished 
converter.on("end_parsed", function (jsonArray) {
	data += JSON.stringify(jsonArray) + ",\n";
	which += 1;
	require("fs").createReadStream("./data/Twitter 23 Feb 2016/" + 
		files[which] + ".csv").pipe(converter2);
});

converter2.on("end_parsed", function (jsonArray) {
	data += JSON.stringify(jsonArray) + ",\n";
	which += 1;
	require("fs").createReadStream("./data/Twitter 23 Feb 2016/" + 
		files[which] + ".csv").pipe(converter3);
});

converter3.on("end_parsed", function (jsonArray) {
	data += JSON.stringify(jsonArray) + ",\n";
	which += 1;
	require("fs").createReadStream("./data/Twitter 23 Feb 2016/" + 
		files[which] + ".csv").pipe(converter4);
});

converter4.on("end_parsed", function (jsonArray) {
	data = JSON.stringify(jsonArray);
	require("fs").writeFile("./data/imported_data_"+which+".js", data);
});
 

 
var files = [
	"12.50-1.10",
	"13.20-13.40",
	"14.10-14.30",
	"14.40-15.00"
	];
var which = 3;

//read from first file.
require("fs").createReadStream("./data/Twitter 23 Feb 2016/" + 
	files[which] + ".csv").pipe(converter4);
