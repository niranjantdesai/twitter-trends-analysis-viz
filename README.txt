# DESCRIPTION

The code is organized in the CODE directory according to the following directory structure:

clustering_experiments:

historical_vis:

real_time_vis: Main Python script, additional helper Python and Node.js scripts and an HTML with D3 JS code for visualizing real-time trends

related_trends:

scripts: Node JS script to get Google Trends interest over time data for the trends in the historical Twitter dataset

package.json and package-lock.json: Node.js dependencies

python_requirements.txt: Python package dependencies


# INSTALLATION

## Node.js
First install the NPM package manager and Node.js, then run the following command from the CODE directory to install all Node.js dependencies:
```
npm install 
```

## Python
First install Python 3 and the pip package manager, then run the following command from the Python directory to install all Python dependencies:
```
pip install -r python_requirements.txt
```
It's recommended to install these packages in a virtual environment to avoid any conflicts with your system Python.

# EXECUTION

## Historical view


## Real-time view
To access the Twitter API, you need an API key and access token which you can get by signing up for a developer account here: https://developer.twitter.com/en/docs.html. Store your credentials in the following JSON format:
{
	"consumer_key": "your consumer key",
	"consumer_secret": "your consumer secret key",
	"access_token": "your access token",
	"access_token_secret": "your access secret token"
}

To run the visualizations on the current trends, run the following command from the `real_time_vis` directory:
```
python real_time_vis.py -i <path-to-twitter-credentials-json>
```
The script will open an HTML page in your default browser at the end of its execution which will show the visualizations. If your default browser is not Firefox, copy-paste the link to Firefox.

## Scripts
To get the Google Trends interest over time data for the trends in the historical Twitter dataset, run the following command:
```
node googletrends_interestOT.js <path-to-twitter-csv> <path-to-output-csv>
```

To get the Wikipedia pageviews, run the following command:
```

```