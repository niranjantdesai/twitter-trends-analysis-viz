import pageviewapi as pgviews
import wikipedia as wiki
import pandas as pd
import numpy as np
from scipy.interpolate import interp1d
from datetime import datetime, timedelta


def interpolate_zeros(y):
    x = np.arange(len(y))
    idx = np.nonzero(y)
    interp = interp1d(x[idx], y[idx], fill_value="extrapolate")
    return interp(x)


def get_wiki_pageviews(twitter_file: str, wiki_file: str):
    """
    Get Wikipedia pageviews for each Twitter trend and save them in a csv
    :param twitter_file: path to csv with Twitter trends
    :param wiki_file: path to output csv where Wiki pageviews will be written
    """
    timeStamps = pd.read_csv(twitter_file, header=0, index_col=0)
    ts_per_article = pd.DataFrame(columns=['trend',	't-15',	't-14',	't-13',	't-12',	't-11',	't-10',	't-9',	't-8',	't-7',
                               't-6',	't-5',	't-4',	't-3',	't-2',	't-1',	't'])

    for index, row in timeStamps.iterrows():
        days_before = 15
        topic = row[2]
        start_date = (datetime.today() - timedelta(days=days_before+1)).strftime('%Y%m%d')
        end_date = datetime.today().strftime('%Y%m%d')

        try:
            suggestion = wiki.search(topic)
            if len(suggestion) > 0:
                interpreted_topic = suggestion[0]
            else:
                interpreted_topic = 'NA'

            if interpreted_topic is not 'NA':
                topic_views = pgviews.per_article('en.wikipedia', interpreted_topic, start_date, end_date, agent='user',
                                                      access='all-access', granularity='daily')['items']
                day_list = topic_views
                views_list = np.array(list(map(lambda i: i['views'], day_list)))
                views_list = interpolate_zeros(views_list)
                views_list = np.array(views_list).astype(int)

                ts_per_article = ts_per_article.append({'trend': interpreted_topic, 't-15': views_list[0], 't-14':views_list[1], 't-13':views_list[2],'t-12':views_list[3],
                               't-11':views_list[4], 't-10':views_list[5], 't-9':views_list[6], 't-8':views_list[7], 't-7':views_list[8],
                                't-6':views_list[9], 't-5':views_list[10], 't-4':views_list[11], 't-3':views_list[12], 't-2':views_list[13],
                                't-1':views_list[14], 't':views_list[15]}, ignore_index=True)

        except Exception:
            interpreted_topic = topic

    ts_per_article[['t-15',	't-14',	't-13',	't-12',	't-11',	't-10',	't-9',	't-8',	't-7',
                               't-6',	't-5',	't-4',	't-3',	't-2',	't-1',	't']] = ts_per_article[['t-15',	't-14',	't-13',	't-12',	't-11',	't-10',	't-9',	't-8',	't-7',
                               't-6',	't-5',	't-4',	't-3',	't-2',	't-1',	't']].astype(int)
    ts_per_article.to_csv(wiki_file, index=False, header=True, encoding='utf-8')