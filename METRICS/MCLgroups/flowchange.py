import os, sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import multiprocessing
import seaborn as sns
sns.set(color_codes=True)

runmcl = True
gensorted = 1

try:
    filename = sys.argv[1]
except:
    print 'no filename entered'

if runmcl : os.system('rm -rf runs/*.mcl')
if gensorted : os.system('rm -rf sorted/*')



def mainfunction(iflow):
    #optional pi argument
    if runmcl: sysout = os.system("/Users/%s/local/bin/mcl %s --abc -pi 1 -o ./runs/%d.mcl -I %d"%(os.environ.get('USER'),filename,iflow,iflow))

    data = tuple(open('./runs/%s.mcl'%iflow))
    groups = [i.replace('\n','').split('\t') for i in data]
    linelen = [len(i) for i in groups]

    nspecs  = lambda x : np.array(groups)[[j==x for j in linelen]]

    groups = [sorted(s, key=lambda x: x[::-1]) for s in groups]


    if gensorted:
        f = open('./sorted/%2d.txt'%iflow, 'w')

        for n in range(1,max(linelen)+1):
            
            if (len(nspecs(n))>0):
                
                print n
                f.write('%s\n'%n)
                for i in sorted(nspecs(n), key=lambda x: x[0][::-1]):
                    str = ''
                    for j in range(n):
                        str+= '%15s '%i[j] 
                    #print str  
                    f.write(str+'\n')  
                    
        f.close()            

    #plt.clf()
    #sns.distplot(linelen);
    #plt.savefig('./sorted/dist%2d.png'%iflow)



    ndict = []
    for n in range(1,max(linelen)+1):
        if (len(nspecs(n))>0):
            for i in sorted(nspecs(n), key=lambda x: x[0][::-1]):
                for j in i: 
                    ndict.append([j,n])
            
    ndict = dict(ndict)        
    sortedspecs = sorted(ndict.keys()  , key=lambda x: x[::-1])
    print sortedspecs
    return [ndict[i] for i in sortedspecs]
    
inputflows = [2,3,4,5,6,7,8]#1.5 - 5

allruns  = multiprocessing.Pool(1).map(mainfunction, inputflows)

plt.clf()

print 'finished, plotting'

res = np.array(allruns)
values = set(res.flatten())

classify = dict()
for i,j in enumerate(values):
    classify[j]= i 

for i in xrange(res.shape[0]):
    for j in xrange(res.shape[1]):
        res[i,j] = classify[res[i,j]]


sns.heatmap(res,cmap='gnuplot') 
plt.show()