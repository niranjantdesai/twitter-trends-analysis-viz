// Script for retrieving Google trends related to historical Twitter data

const googleTrends = require('google-trends-api');
const csv = require('csv-parser')
const fs = require('fs')


// parse csv with timestamps, save start and end dates for each tag as a dict
// TODO: check if the timezones are correct
// TODO: handle API timeouts
// TODO: save twitter_trends to json
// var timestamps = {};
var twitter_trends = {};
var count = 0;
fs.createReadStream('data/timeStamps.csv')
  .pipe(csv({headers: false}))
  .on('data', (row) => {
    if(count <= 10) {
      // console.log(row)
      var split_startDate = row[1].split(" ")[0].split("/");
      var split_endDate = row[2].split(" ")[0].split("/");
      var start_datestring = '20' + split_startDate[2] + '-' + split_startDate[0] + '-' + split_startDate[1];
      var end_datestring = '20' + split_endDate[2] + '-'+ split_endDate[0] + '-' + split_endDate[1];
      var start_date = new Date(start_datestring);
      var end_date = new Date(end_datestring);
      ++count;
      // timestamps[row[0]] = {'start_date': start_date, 'end_date': end_date};
      // callAPI(row[0], startDate, endDate)

      // Get the related topics from Google Trends for the current tag
      googleTrends.relatedTopics({keyword: row[0], 
                              startTime: start_date, 
                              endTime: end_date, 
                              geo: 'US'}, 
                              function(err, results) {
        if(err) console.error('Error: ', err);
        else {
            console.log(results);
            // related_trends = results;
            var response = JSON.parse(results);
            response = response['default']['rankedList'][0];
            twitter_trends[row[0]] = response;
        }
      })
    }
  })
  .on('end', () => {
    console.log("finished reading timestamps");
  });