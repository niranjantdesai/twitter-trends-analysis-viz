import pandas as pd
import numpy as np
import os
from Naked.toolshed.shell import execute_js

os.system("python real_time_vis.py -i credentials.json")
success = execute_js('get_google_trends.js')
# print(success)
os.system("python wiki_data.py")