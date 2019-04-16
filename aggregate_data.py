import pandas as pd

wiki = pd.read_csv("wiki_timeseries_full.csv", sep=",")
google = pd.read_csv("output_1 copy.csv", sep=",")
common = pd.merge(wiki, google, how='inner', on='trend')
export_csv = common.to_csv('dataframe.csv')