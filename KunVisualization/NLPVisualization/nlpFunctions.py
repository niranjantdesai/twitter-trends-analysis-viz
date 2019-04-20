#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 13 12:57:27 2019

@author: kuncao
"""
import spacy
import numpy as np
from numpy import isnan
import pandas as pd


np.seterr(divide='ignore', invalid='ignore')
nlp = spacy.load('en_core_web_md')



"""
Input Array of Tags
Returns n x n matrix

example: 
    tag_list = ["Western Michigan", "#GoBlue", "NC State", '#Gators', 'Jake Fromm', 'Sooners']
    
returns: 
 [[1.00000009 0.        0.7155094  0.27580932 0.20292338 0.28489425]
 [0.         0.         0.         0.         0.         0.        ]
 [0.68319021 0.         1.00000002 0.26388563 0.13366481 0.27300507]
 [0.41341673 0.         0.41425577 1.00000005 0.4405506  0.5483852 ]
 [0.13517702 0.         0.09325273 0.19578862 1.00000019 0.1947803 ]
 [0.46938013 0.         0.47106997 0.60276443 0.48174284 1.00000006]]
 
 looking at the first row
 Western Michigan sim WesternMichigan = 1.0
 Western Michigan vs GoBlue = 0
 Western Michigan vs NC State = .71 relatedness
 
 
 second row all 0s because GoBlue is a "non word" should not be considered
 
"""
def getSimilarityOfList(tagList):
    vectorList = []
    normList = []
    
    for tag in tagList:
        
        tag = tag.replace('#','')       
        tempToken = nlp(tag)
        vectorList.append(tempToken.vector)
        normList.append(tempToken.vector_norm)
    
    vectorList = np.asarray(vectorList)
    normList = np.asarray(normList)
    

    ret = np.divide(np.dot(vectorList, vectorList.transpose()),(normList * normList))
    
    whereNans = isnan(ret)
    ret[whereNans] = 0
    return ret



def getComparisonList(dateArray):
    data = pd.read_csv("data/timeStampsDurationLabels.csv")

    retList = []

    for index, row in data.iterrows():
        if row["Start"] in dateArray and row["Tag"] not in retList:
            retList.append(row["Tag"])
        

    return retList

def createGraphCSV(retList, simMatrix):
    threshold = .7
    source = []
    target = []
    value = []
    count = 1
    for i in range(len(simMatrix)):
        for j in range(count, len(simMatrix[0])):
            if simMatrix[i][j] > threshold and retList[i] != retList[j]:
                source.append(retList[i])
                target.append(retList[j])
                value.append(simMatrix[i][j])
                
        
    
    graphDF = pd.DataFrame()
    graphDF["source"] = source
    graphDF["target"] = target
    graphDF["value"] = value
    
    graphDF.to_csv("nlpGraph.csv")
            
       

     
def getSim(tagList):
    ret = []
    
    
    for i in range(len(tagList)):
        print(i)
        tempList = []
        for j in range(len(tagList)):
            token = nlp(tagList[i].replace("#",""))
            token2 = nlp(tagList[j].replace("#",""))
            tempList.append(token.similarity(token2))
        
        ret.append(tempList)
        
    
    return ret


            




if __name__ == "__main__":
    
# =============================================================================
#     token = nlp("NC State")
#     token2 = nlp("Florida State")
#     print(token.similarity(token2))
#     dateArray = ["9/3/17 0:00"]
# =============================================================================
    dateArray = ["9/3/17 0:00", "9/3/17 1:00"]
    retList = getComparisonList(dateArray)
    simMatrix = getSim(retList)
    createGraphCSV(retList, simMatrix)
    
    
        








        
    
    
    
    
