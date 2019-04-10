# Getting Google Trends data

## Installation
Install NodeJS first. After that, install the dependencies using the following commands:
```
npm install file-system --save
npm install google-trends-api
npm i --save csvtojson
npm install csv-write-stream
npm install fast-csv
```

## Running
1. Set the path to the csv file on line 12
2. Change the row range on line 25 if needed

Run the script using 
```
node googletrends_interestOT.js
```