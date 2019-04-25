const fs = require('fs');
const googleTrends = require('google-trends-api');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var csvWriter = require('csv-write-stream')
var fastcsv = require('fast-csv');
var path = require('path');
var dataArray = [];
var trend_names = [];
var all = [];

const csvFilePath = process.argv[2];
const out_csv_path = process.argv[3];
const csv=require('csvtojson')

var lookback = 15

new Promise(function(resolve, reject) {
  const stream = fs.createReadStream(csvFilePath);
  const json = csv().fromStream(stream);
  resolve(json);

}).then(async function(result) {
  var promises = [];

  for (var i = 0, p = Promise.resolve(); i < result.length; i++) {
    trend_name = result[i].Term
    console.log(trend_name)
    var startDate = new Date(result[i].start)
    startDate.setDate(startDate.getDate() - lookback)
    var endDate = new Date(result[i].end)
    var success = true
 
    await interestOverTime(result[i].Term, startDate, endDate)
      .then(function(api_results){
        trend_names.push(trend_name);
        promises.push(api_results);
      })
      .catch((err) => {
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
        for (var i = 0; i < promises.length; i++) {
          var obj = JSON.parse(promises[i])
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
        // // decrement index because we have to query it again
        // --i;
        success = false
      });

      if(!success)
        break

      // nasty hack to wait
      var wait_seconds = 1
      var waitTill = new Date(new Date().getTime() + wait_seconds * 1000)
      while(waitTill > new Date()){}
  }
  return Promise.all(promises)

}).then(function(result) {
  var values = []
  var super_values = []
  var temp = {
      table:[]
  };

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
  writer.pipe(fs.createWriteStream(out_csv_path))
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

function saveTempResult(result) {
  console.log("arrived")
  console.log(result)
  console.log("length of result", result.length)
  for (var i = 0; i < result.length; i++) {
    console.log(result[i])
  }
}


function interestOverTime(trend, startDate, endDate) {
   return new Promise(function(resolve, reject){
      googleTrends.interestOverTime({keyword: trend, startTime: startDate, endTime: endDate})
      .then(function(results){
        return resolve(results);
      })
      .catch(function(err){
        return reject(err);
      })
   });
}
