# import webbrowser
import tweepy
import csv
import json
import argparse
from Naked.toolshed.shell import execute_js
from wiki_data import get_wiki_pageviews


def get_twitter_trends(credentials_json):
    """
    Get topics currently trending on Twitter, excluding hashtags

    Arguments:
    credentials_json: a json file with the credentials required for authentication

    Returns:
    a dictionary with the top 50 trends in the USA
    """

    # load credentials
    file = open(credentials_json)
    json_str = file.read()
    credentials = json.loads(json_str)

    auth = tweepy.OAuthHandler(credentials['consumer_key'], credentials['consumer_secret'])
    auth.set_access_token(credentials['access_token'], credentials['access_token_secret'])

    api = tweepy.API(auth)

    usa_woeid = 23424977
    trends = api.trends_place(id=usa_woeid, exclude='hashtags')
    return trends


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input',
                        required=True,
                        type=str,
                        dest='credentials_json',
                        help='json file with Twitter API credentials')
    args = parser.parse_args()

    # get current Twitter trends
    print('Getting Twitter trends...')
    trends = get_twitter_trends(args.credentials_json)

    # save Twitter trends to a csv
    keys = trends[0]['trends'][0].keys()
    twitter_file = 'twitter_trends.csv'
    with open(twitter_file, 'w', newline='') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(trends[0]['trends'])

    # get the Google Trends interest over time for each topic by running a Node JS script
    print('Getting corresponding Google Trends data')
    google_file = 'google_trends.csv'
    node_args = twitter_file + " " + google_file
    success = execute_js('get_google_trends.js', node_args)
    if success:
        print('Google Trends interest over time saved')
    else:
        print('Unable to save Google Trends interest over time, exiting')

    # get the Wikipedia pageviews for each topic
    print('Getting corresponding Wikipedia pageview data')
    wiki_file = 'wiki_pageviews.csv'
    get_wiki_pageviews(twitter_file, wiki_file)

    # open html file with the visualizations
    # url = "file:///C:/Users/niran/OneDrive%20-%20Georgia%20Institute%20of%20Technology/GaTech/courses/          CSE_6242_Data_and_Visual_Analytics/cse-6242-assignments/hw2-skeleton/Q2/graph.html"
    # webbrowser.open(url, new=2)  # open in a new tab if possible


if __name__ == "__main__":
    main()
