// Script for retrieving Google trends related to historical Twitter data

const googleTrends = require('google-trends-api');
const csv = require('csv-parser')
const fs = require('fs')

// parse csv with historical Twitter trends
const twitter_trends = [];
fs.createReadStream('../data/historical_twitter_trends.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {});

var related_trends = {};
// TODO: check if dates are passed correctly
googleTrends.relatedTopics({keyword: 'Western Michigan', 
                            // startTime: new Date(2017, 9, 3, 9, 0, 0, 0), 
                            // endTime: new Date(2017, 9, 3, 14, 0, 0, 0),
                            startTime: new Date(2017, 9, 3), 
                            endTime: new Date(2017, 9, 4), 
                            geo: 'US', 
                            // timezone: 0,
                            granularTimeResolution: true}, 
                            function(err, results) {
    if(err) console.error('Error: ', err);
    else {
        console.log(results);
        // related_trends = results;
        var response = JSON.parse(results);
        response = response['default']['rankedList'][0];
        related_trends['Western Michigan'] = response;
        var x = 1;
    }
})