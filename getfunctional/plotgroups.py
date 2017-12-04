import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns; sns.set()
import sys

plt.ion()

plt.close()


s=plt.show

df = pd.read_csv('groupings.csv',index_col=0)
ap =[ i.split('\t')[-1].replace(' ','').replace('\n','') for i in tuple(open('apinene.specs'))]
oc =[ i.split('\t')[-1].replace(' ','').replace('\n','') for i in tuple(open('octane.specs'))]

cols = filter(lambda x:x!= 'No functional',df.columns)
apdf = df.loc[ap,cols]
ocdf = df.loc[oc,cols]

#

apinene = (apdf.sum()/len(apdf))
octane = (ocdf.sum()/len(ocdf))


##fre1
merged = pd.DataFrame()
merged['a pinene']= apinene
merged['octane'] = octane
ax = merged.plot(kind='barh')
ax.set_ylabel('freq. of functional group')
print 'aa'


'''
#n compunds
atal=[0]*30
otal=[0]*30
for i in cols:
    for j in apdf.index:
        atal[apdf.loc[j,i]]+=1
for i in cols:
    for j in ocdf.index:
        otal[ocdf.loc[j,i]]+=1

merged = pd.DataFrame()
merged['a pinene']= atal
merged['octane'] = otal

merged = merged.loc[merged.sum(axis=1)>0.    ,:]
merged = merged.loc[1:    ,:]


ax = merged.plot(kind='bar')
ax.set_ylabel('No Compounds')

ax.set_xlabel('No functionalizations')
print 'aa'
'''
'''
from collections import Counter

wordcount = Counter(list(df.T.sum()))
data = [item for item in wordcount.items()]

atal= apdf.T.sum().groupby(lambda x: apdf.T.sum()[x])

otal= ocdf.T.sum().groupby(lambda x: ocdf.T.sum()[x])
merged = pd.DataFrame()
merged['a pinene']= atal.size()
merged['octane'] = otal.size()

merged.fillna(0, inplace=True)
ax = merged.plot(kind='bar')
ax.set_ylabel('No Compounds')

ax.set_xlabel('No functionalizations')
'''

plt.savefig('test.png')







'''

df = ocdf

df = df.ix[(df.sum(axis=1)-df.nogroups).sort_values().index]

ax = sns.heatmap(df)

ax.axes.get_yaxis().set_visible(False)
plt.set_ylabel('All Species')


print 'show'
plt.show()
'''
