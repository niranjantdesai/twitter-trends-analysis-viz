import pandas as pd
import numpy as np

w_data = pd.read_csv("wiki_trends.csv")
g_data = pd.read_csv("google_trends.csv")
#
# print(w_data)
# print(g_data)

merged = g_data.join(w_data.set_index('trend'), on='trend')
# print(merged)
merged.to_csv('merged.csv',index=False)