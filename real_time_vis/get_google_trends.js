const fs = require('fs');
const googleTrends = require('google-trends-api');
const csv = require('csvtojson');
var csvWriter = require('csv-write-stream')

// path to input csv with Twitter trends
const csvFilePath = process.argv[2];
console.log(csvFilePath);
// path to output csv where Google Trends data will be written
const out_csv_path = process.argv[3];
console.log(out_csv_path);

var lookback = 15;
var trend_names = [];

// read the csv with the current Twitter trends
new Promise(function(resolve, reject) {
  const stream = fs.createReadStream(csvFilePath);
  const json = csv().fromStream(stream);
  resolve(json);
})
// iterate over all trends and get Google Trends interest over time for each trend
.then(async function(result) {
  var promises = [];

  for (var i = 0, p = Promise.resolve(); i < result.length; i++) {
    trend_name = result[i].name;
    // console.log(trend_name)

    // start time is the current time minus the lookback period, end time is the
    // current time
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - lookback);
    var endDate = new Date();
    var success = true;
    
    // get Google Trends interest over time for the current trend in the list
    await interestOverTime(trend_name, startDate, endDate)
      .then(function(api_results){
        trend_names.push(trend_name);
        promises.push(api_results);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return Promise.all(promises)
})
// save results to a csv
.then(function(result) {
  // write headers
  var headers = ["trend"];
  var timestamps = [];
  for(var t = lookback; t > 0; t--)
  {
    headers.push("t-" + t);
    timestamps.push("NaN");
  }

  headers.push("t");
  timestamps.push("NaN");
  var writer = csvWriter({ headers: headers});

  // write to csv
  writer.pipe(fs.createWriteStream(out_csv_path));
  for (var i = 0; i < result.length; i++) {
    var obj = JSON.parse(result[i]);
    var keysArray = obj.default.timelineData;
    for (var j = 0; j < keysArray.length; j++) {
      val = [keysArray[j].formattedTime, keysArray[j].formattedValue[0]];
      timestamps[j] = keysArray[j].formattedValue[0];
    }
    writer.write([trend_names[i]].concat(timestamps));
  }
  writer.end();
});

// Get Google Trends interest over time for a trend and given time period
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