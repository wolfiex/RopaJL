import os, sys, re
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import multiprocessing
import seaborn as sns


def groupbys(filename):
    d = tuple(open(filename))

    main = []
    dummy = []
    lastint = 0
    for i in d:
        try:
            int(i)
            main.append([dummy,lastint])
            dummy = []
            lastint = int(i)
        except:
                dummy.append( sorted([j for j in set([i.strip(' ') for i in re.findall(r'[^\s]*',i) if i!= ''])], key=lambda x: x[::-1]))
            
            
    f=open(filename +'.groupby.txt','w')

    for i in main:
        if len(i[0])>0:
            df = pd.DataFrame(sorted(i[0], key=lambda x: x[0][::-1]))
            
            f.write('\n\ngroup of %d\n'%i[1])
            f.write( str(df.groupby([i for i in reversed(df.columns)]).size().sort_values(ascending=False)))
            
    f.close()
    
    return True
    
    
if __name__ == "__main__":
    filename  = sys.argv[1]
    groupbys(filename)#'sorted/simplified2.000000.txt'

    