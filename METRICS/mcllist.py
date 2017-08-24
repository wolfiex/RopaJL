import os,sys

file = sys.argv[1]

data = tuple(open(file))
groups = [i.replace('\n','').split('\t') for i in data]
linelen = [len(i) for i in groups]

import numpy as np
import pandas as pd
from scipy import stats, integrate
import matplotlib.pyplot as plt

import seaborn as sns
sns.set(color_codes=True)
sns.distplot(linelen);
plt.savefig('gdist_'+file.split('.')[0]+'.png')

nspecs  = lambda x : np.array(groups)[[j==x for j in linelen]]

groups = [sorted(s, key=lambda x: x[::-1]) for s in groups]


f = open('mclgroups_'+file.split('.')[0]+'.txt', 'w')

for n in range(1,max(linelen)+1):
    
    if (len(nspecs(n))>0):
        
        print n
        f.write('%s\n'%n)
        for i in sorted(nspecs(n), key=lambda x: x[0][::-1]):
            str = ''
            for j in range(n):
                str+= '%15s '%i[j] 
            print str  
            f.write(str+'\n')  
            
f.close()            