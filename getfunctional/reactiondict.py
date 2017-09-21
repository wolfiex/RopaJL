
import pandas as pd
import numpy as np
import os, sys, multiprocessing, re, glob


data = tuple(open('mcm331complete.kpp'))

fullstr='~'.join(data).replace('\n','').replace('\t','').replace(' ','')
eqn = [i.replace(' ','').split(':') for i in re.findall(r'[^/]{0,2}\{[\. \s\w\d]*\}([A-z0-9+-=:()*/]*);~' ,fullstr)]

#sort
eqn = sorted(eqn,key = lambda x: x[1])



nocoeff = re.compile(r'\b[\d\.]*(\w+)\b')


def prodrct(x):
    i = x[0].split('=')
    return [list(nocoeff.findall(i[0])), list(nocoeff.findall(i[1]))]

eq_split = multiprocessing.Pool(4).map(prodrct,eqn)


allspecs=[]
for i in eq_split:
    allspecs.extend(i[0]+i[1])
    

mydict = {}
print 'start'
for i in allspecs:
    rxn = [[],[]]
    for z,j in enumerate(eq_split):
        if i in j[0]:
            rxn[0].append(z)
        if i in j[1]:
            rxn[1].append(z)
    mydict[i]=rxn 
    

    
import json
with open('reactswith.json', 'w') as outfile:
    json.dump({'reactions':eq_split, 'names':mydict}, outfile)    
    
    
    
    
    
    
    
    
    