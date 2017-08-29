import os, sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import multiprocessing
import seaborn as sns
sns.set(color_codes=True)

runmcl = True
gensorted = True

try:
    filename = sys.argv[1]
except:
    print 'no filename entered'

if runmcl : os.system('rm -rf runs/*.mcl')
if gensorted : os.system('rm -rf sorted/*')



def mainfunction(iflow, species = False):
    #optional pi argument
    #iflow = iflow*100

    if runmcl: sysout = os.system("/Users/%s/local/bin/mcl %s --abc -pi 1 -o ./runs/%s.mcl -I %s"%(os.environ.get('USER'),filename,iflow,iflow))

    data = tuple(open('./runs/%s.mcl'%iflow))
    groups = [i.replace('\n','').split('\t') for i in data]
    linelen = [len(i) for i in groups]

    nspecs  = lambda x: np.array(filter(lambda j: len(j)==x , groups))

    groups = [sorted(s, key=lambda x: x[::-1]) for s in groups]


    if gensorted:
        f = open('./sorted/%2f.txt'%iflow, 'w')

        for n in range(1,max(linelen)+1):

            if (len(nspecs(n))>0):
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

    if species : return sortedspecs
    #print sortedspecs
    return [ndict[i] for i in sortedspecs]

inputflows = np.linspace(1,10,19)#[2,3,4,5,6,7,8]#1.5 - 5
inputflows = [i for i in reversed(filter(lambda x: x>1.6,inputflows))]

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
        1+1
        #res[i,j] = classify[res[i,j]]


df = pd.DataFrame(res,index = inputflows,columns = mainfunction(2,True))

# sort by difference
#df = df.reindex_axis(df.apply(lambda x: x.max()-x.min()).sort_values().index, axis=1)

#sort by mean
df = df.reindex_axis(df.mean().sort_values().index, axis=1)


sns.heatmap(df,cmap='Spectral')
plt.xticks(rotation=90)
plt.show()

sns.clustermap(df,cmap='Spectral')
plt.xticks(rotation=90)
plt.show()
