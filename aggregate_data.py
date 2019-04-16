import pandas as pd

wiki = pd.read_csv("wiki_timeseries_full.csv", sep=",")
google = pd.read_csv("output_1.csv", sep=",")
len = pd.read_csv("output_1.csv", sep=",").shape[0]
google.index = list(range(len))
google.reset_index(level=0, inplace=True)
google.rename(columns={'index': 'google_index'}, inplace=True)
common = pd.merge(wiki, google, how='inner', on='trend')
export_csv = common.to_csv('dataframe.csv')
new_wiki = common.loc[:, 'wiki_id':'mean']
temp_1 = common.loc[:, 'trend']
temp_3 = common.loc[:, 'google_index']
temp_2 = common.loc[:, 't-15_y':'t']
frames = [temp_1, temp_3, temp_2]
new_1 = pd.concat(frames, axis=1)
new_1 = new_1.drop_duplicates('google_index')
google_csv = new_1.to_csv('google_data.csv')
new_wiki = new_wiki.drop_duplicates('wiki_id')
wiki_csv = new_wiki.to_csv('wiki_data.csv')