const fs = require('fs');
const googleTrends = require('google-trends-api');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var csvWriter = require('csv-write-stream')
var fastcsv = require('fast-csv');
var dataArray = [];
var trend_names = [];
var all = [];

const csvFilePath='timeStamps_small.csv'
const csv=require('csvtojson')

var lookback = 15

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
    startDateOriginal.setDate(startDateOriginal.getDate() - lookback);   // lookback
    startDateOriginal = new Date(startDateOriginal.toUTCString().substr(0, 25))
    // var endDateOriginal = new Date(endDate);
    var endDateOriginal = new Date(new Date(endDate).toUTCString().substr(0, 25))
    result[i].startDate = startDateOriginal
    result[i].endDate = endDateOriginal
    all.push([result[i].Trend, startDateOriginal, endDateOriginal])
  }
  return result

}).then(async function(result) { // (***)
  var promises = [];


  for (var i = 0, p = Promise.resolve(); i < result.length; i++) {
    trend_name = result[i].Trend
    console.log(trend_name)
    // val = interestOverTime(result[i].Trend, result[i].startDate, result[i].endDate)
    // promises.push(val)
    // p = p.then(_ => interestOverTime(result[i].Trend, result[i].startDate, result[i].endDate)
    //   .then(function(api_results){
    //     trend_names.push(trend_name);
    //     promises.push(api_results);
    //   })
    //   .catch(function(err){
    //     var wait_seconds = 60;
    //     var waitTill = new Date(new Date().getTime() + wait_seconds * 1000);
    //     while(waitTill > new Date()){}
    //     --i;
    //   })
    // );
    await interestOverTime(result[i].Trend, result[i].startDate, result[i].endDate)
      .then(function(api_results){
        trend_names.push(trend_name);
        promises.push(api_results);
        // console.log("promises", promises)
      })
      .catch((err) => {
        // console.log("promises", promises)
        var index = 0
        var headers = ["trend"]
        var timestamps = []
        for(var t = lookback; t > 0; t--)
        {
          headers.push("t-" + t)
          timestamps.push("NaN")
        }
        headers.push("t")
        timestamps.push("NaN")

        if (!fs.existsSync('temp.csv')){
          var writer = csvWriter({ headers: headers});
        } else {
          var writer = csvWriter({sendHeaders: false});
        }

        writer.pipe(fs.createWriteStream('temp.csv', {flags: 'a'}))
        // writer.write("hello bro")
        for (var i = 0; i < promises.length; i++) {
          var obj = JSON.parse(promises[i])
          // console.log(obj.default.timelineData)
          var keysArray = obj.default.timelineData
          for (var j = 0; j < keysArray.length; j++) {
            val = []
            val = [keysArray[j].formattedTime, keysArray[j].formattedValue[0]]
            timestamps[j] = keysArray[j].formattedValue[0]
          }
          writer.write([trend_names[i]].concat(timestamps))
        }
        writer.end()

        console.log('promise rejected')
        console.log(err)
        var wait_seconds = 60;
        // nasty hack to wait
        var waitTill = new Date(new Date().getTime() + wait_seconds * 1000);
        while(waitTill > new Date()){}
        // decrement index because we have to query it again
        --i;
      });
  }
  return Promise.all(promises)

}).then(function(result) {
  // console.log(result)
  var values = []
  var super_values = []
  var temp = {
      table:[]
  };

  // console.log(all)
  var index = 0
  var headers = ["trend"]
  var timestamps = []
  for(var t = lookback; t > 0; t--)
  {
    headers.push("t-" + t)
    timestamps.push("NaN")
  }
  headers.push("t")
  timestamps.push("NaN")

  var writer = csvWriter({ headers: headers})
  writer.pipe(fs.createWriteStream('output_largeCSV.csv'))
  for (var i = 0; i < result.length; i++) {
    var obj = JSON.parse(result[i])
    var keysArray = obj.default.timelineData
    for (var j = 0; j < keysArray.length; j++) {
      val = []
      val = [keysArray[j].formattedTime, keysArray[j].formattedValue[0]]
      timestamps[j] = keysArray[j].formattedValue[0]
    }
    writer.write([trend_names[i]].concat(timestamps))
  }
  writer.end()

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

function saveTempResult(result) {
  console.log("arrived")
  console.log(result)
  console.log("length of result", result.length)
  for (var i = 0; i < result.length; i++) {
    console.log(result[i])
  }
   // return new Promise(function(resolve, reject){
   //    // var api_return = googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate});
   //    // return resolve(api_return);
   //    // return reject(error);
   //    googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate})
   //    .then(function(results){
   //      return resolve(results);
   //    })
   //    .catch(function(err){
   //      return reject(err);
   //    })
   // });
}


function interestOverTime(trend, startDate, endDate) {
   return new Promise(function(resolve, reject){
      // var api_return = googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate});
      // return resolve(api_return);
      // return reject(error);
      googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate})
      .then(function(results){
        return resolve(results);
      })
      .catch(function(err){
        return reject(err);
      })
   });
}
