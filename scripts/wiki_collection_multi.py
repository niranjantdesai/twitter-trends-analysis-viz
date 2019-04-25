# -*- coding: utf-8 -*-
"""
Created on Sun Mar 10 18:03:27 2019

@author: Harrison Delecki

"""
import pageviewapi as pgviews
import wikipedia as wiki
import pandas as pd
import numpy as np
from scipy.interpolate import interp1d
import time
import json
from multiprocessing import Pool


def parse(row):
    days_before = 15
    days_after = 15
    day_idx = np.arange(days_before + days_after)
    print(row[0])
#    if row[0] % 100 == 0:
#        time.sleep(1)
    index = row[0]
    row = row[1]
    topic = row[0]
    #topic = topic.replace('#', '')
    # print(topic)

    start_date = (row[1] - pd.Timedelta(days=days_before)).strftime('%Y%m%d')
    end_date = (row[1] + pd.Timedelta(days=days_after)).strftime('%Y%m%d')
    # print(start_date, end_date)

    try:
        suggestion = wiki.search(topic)
        if len(suggestion) > 0:
            #print('Interpreting topic ' + topic + ' as ' + suggestion[0])
            interpreted_topic = suggestion[0]
            #opic_views = pgviews.per_article('en.wikipedia', topic, start_date, end_date, agent='user', access='all-access', granularity='daily')
        else:
            interpreted_topic = topic
            return [index, topic] + [interpreted_topic]+[row[1]]+list(np.full(days_before+days_after+1, np.nan))

        topic_views = pgviews.per_article('en.wikipedia', interpreted_topic, start_date, end_date, agent='user', access='all-access', granularity='daily')['items']
        # print(topic_views, '--------------\n')

        if len(topic_views) < 16:
            return [index, topic] + [interpreted_topic]+[row[1]]+list(np.full(days_before+days_after+1, np.nan))

    except Exception:
        interpreted_topic = topic
        return [index, topic] + [interpreted_topic]+[row[1]]+list(np.full(days_before+days_after+1, np.nan))


    day_list = topic_views
    views_list = np.array(list(map(lambda i: i['views'], day_list)))

    #print(views_list)
    views_list = interpolate_zeros(views_list)

    pct_change = np.diff(views_list) / views_list[0:-1] * 100
    if np.max(pct_change[13:16]) < 10:
        return [index, topic] + [interpreted_topic]+[row[1]]+list(np.full(days_before+days_after+1, np.nan))

    return [index, topic] + [interpreted_topic] + [row[1]] + list(views_list) + [np.mean(views_list)]


def interpolate_zeros(y):
    x = np.arange(len(y))
    idx = np.nonzero(y)
    #print(y)
    interp = interp1d(x[idx],y[idx], fill_value="extrapolate")
    return interp(x)



def main():

    timeStamps = pd.read_csv('cleaned.csv', parse_dates=[2,3], header=0, index_col=0)
    n_rows = np.shape(timeStamps)[0]
    print(n_rows)

    records = []

    with Pool(10) as p:
        records = p.map(parse, timeStamps.iterrows())

    #records = []
#    for idx, row in timeStamps.iterrows():
#        r = parse(row)
#        records.append(r)

    # print(records)

    ts_per_article = pd.DataFrame(records)
    print(ts_per_article.head())


    ts_per_article.to_csv('wiki_timeseries.csv', index=False, header=False, encoding='utf-8')

if __name__ == '__main__':

    start = time.time()
    main()
    end = time.time()
    print(end - start)

