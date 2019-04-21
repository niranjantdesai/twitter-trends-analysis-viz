import webbrowser
import tweepy
import csv
import json
import argparse


def get_twitter_trends(credentials_json):
    """
    Get topics currently trending on Twitter, excluding hashtags

    Arguments:
    credentials_json: a json file with the credentials required for authentication

    Returns:
    a dictionary with the top 50 trends in the USA
    """

    # # credentials
    consumer_key = "NuEI9OAkwNgHnti6RiPY0jeD1"
    consumer_secret = "aeqpj93jp0ylBi0iee4MJ2RTGQ4zq0smrRlCPl5X0BMfhvD96q"
    access_token = "56968225-Wl4Pr8VHs9epLQm5q5dRhZaiEyGby7GZMGaJa5l2w"
    access_token_secret = "IfLiDm5sOd5m5ozK8M4ZIqDAnkOuGQDtxB8KwAHRaGdJM"

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
    print(args)
    # get current Twitter trends
    trends = get_twitter_trends(args.credentials_json)

    # save Twitter trends to a csv
    keys = trends[0]['trends'][0].keys()
    with open('twitter_trends.csv', 'w') as output_file:
        dict_writer = csv.DictWriter(output_file, keys)
        dict_writer.writeheader()
        dict_writer.writerows(trends[0]['trends'])

    # open html file with the visualizations
    # url = "file:///C:/Users/niran/OneDrive%20-%20Georgia%20Institute%20of%20Technology/GaTech/courses/          CSE_6242_Data_and_Visual_Analytics/cse-6242-assignments/hw2-skeleton/Q2/graph.html"
    # webbrowser.open(url, new=2)  # open in a new tab if possible


if __name__ == "__main__":
    main()
