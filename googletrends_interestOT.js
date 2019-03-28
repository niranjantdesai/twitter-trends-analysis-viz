const fs = require('fs');
const googleTrends = require('google-trends-api');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
// var csvWriter = require('csv-write-stream')
var fastcsv = require('fast-csv');
var dataArray = [];
var trend_names = [];
var all = [];

const csvFilePath='timeStamps_small.csv'
const csv=require('csvtojson')

new Promise(function(resolve, reject) {
  const stream = fs.createReadStream(csvFilePath);
  const json = csv().fromStream(stream);
  resolve(json);

}).then(function(result) {
  for(var i = 0; i < result.length; i++) {
    var obj = result[i];
    var split_startDate = obj.startDate.split(" ")[0].split("/");
    var split_endDate = obj.endDate.split(" ")[0].split("/");
    var startDate = '20'+split_startDate[2]+'-'+split_startDate[0]+'-'+split_startDate[1]
    var endDate = '20'+split_endDate[2]+'-'+split_endDate[0]+'-'+split_endDate[1]
    var startDateOriginal = new Date(startDate);
    startDateOriginal.setDate(startDateOriginal.getDate()-5);
    var endDateOriginal = new Date(endDate);
    // endDateOriginal.setDate(endDateOriginal.getDate()-5);
    result[i].startDate = startDateOriginal
    result[i].endDate = endDateOriginal
    all.push([result[i].Trend, startDateOriginal, endDateOriginal])
  }
  return result

}).then(function(result) { // (***)
  var promises = [];

  for (var i = 0; i < result.length; i++) {
    trend_name = result[i].Trend
    trend_names.push(trend_name)
    val = interestOverTime(result[i].Trend, result[i].startDate, result[i].endDate)
    promises.push(val)
  }
  return Promise.all(promises)

}).then(function(result) {
  console.log(result)
  var values = []
  var super_values = []
  var temp = {
      table:[]
  };
  // console.log(all)
  var index = 0;
  for (var i = 0; i < result.length; i++) {
    var obj = JSON.parse(result[i])
    // console.log(obj.default.timelineData)
    var keysArray = obj.default.timelineData
    for (var j = 0; j < keysArray.length; j++) {
      val = []
      val = [keysArray[j].formattedTime, keysArray[j].formattedValue[0]]
      var fast_csv = fastcsv.createWriteStream();
      var writer = fs.createWriteStream("outputfile.csv");

      fast_csv.pipe(writer);
      fast_csv.write(all[i][0],keysArray[j].formattedTime, keysArray[j].formattedValue[0]);
      fast_csv.end();
      // writer.pipe(fs.createWriteStream('output_interest.csv', {flags: 'a'}));
      // writer.write({
      //   header1:"hello",
      //   header2:"world",
      // });
      // writer.end();
      //   console.log(val)
      //   console.log("break")
        // temp_list = [keysArray[j].topic.title,keysArray[j].value]
        // temp.table.push({trend:all[i][0], result:{relatedTopic:keysArray[j].topic.title, value:keysArray[j].value, startDate:all[i][1], endDate:all[i][2]}})
        // index++;
      }
    }

  return temp;

});
// .then(function(result) {
//   console.log(result.table)
//   console.log(all)
//   // fs.writeFile('output.csv', result.table, 'utf8', function (err) {
//   //   if (err) {
//   //     console.log('Some error occured - file either not saved or corrupted file saved.');
//   //   } else{
//   //     console.log('It\'s saved!');
//   //   }
//   // });
// });

function interestOverTime(trend, startDate, endDate) {
   return new Promise(function(resolve, reject){
      var api_return = googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate})
      return resolve(api_return)
      return reject(error)
   });
}
