import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns; sns.set()
import sys,re

plt.ion()

plt.close()


s=plt.show



rename={'Alcohol':'OH','Ketone':'CO','Hydro peroxide':'OOH','Per. Acid':'Pacid','Aldehyde':'CHO','Ether':'O','Nitrate':'ONO2','Carb. Acid':'Acid',
'Alkoxy rad':'RO', u'Peroxalkyl rad':'ROO', u'Peroxyacyl rad':'peroxyacyl rad'}

inorganics = "2 	 N2O5 3 	 H2O2 4 	 NO 5 	 H2 6 	 NA 7 	 HONO 8 	 OH 9 	 SO2 10 	 O 11 	 HNO3 12 	 SO3 13 	 O1D 14 	 HO2 15 	 HO2NO2 16 	 CO 17 	 SA 18 	 O3 19 	 HSO3 20 	 NO2 21 	 NO3"
inorganics = re.findall(r'\w+',inorganics)
inorganics.extend(['CL'])


df = pd.read_csv('groupings.csv',index_col=0)
df = df.loc[[i not in inorganics for i in df.index],:]

ap =[ i.split('\t')[-1].replace(' ','').replace('\n','') for i in tuple(open('apinene.specs'))]
oc =[ i.split('\t')[-1].replace(' ','').replace('\n','') for i in tuple(open('octane.specs'))]

cols = filter(lambda x:x!= 'No functional' + x != 'nofunctional' ,df.columns)
cols = [u'PAN', u'Carb. Acid', u'Ester', u'Ether', u'Per. Acid',
       u'Hydro peroxide', u'Nitrate', u'Aldehyde', u'Ketone', u'Alcohol',u'Alkoxy rad', u'Peroxalkyl rad', u'Peroxyacyl rad']


apdf = df.loc[ap,cols].dropna()
ocdf = df.loc[oc,cols].dropna()




apinene = (apdf.sum()/float(len(apdf)))
octane = (ocdf.sum()/float(len(ocdf)))


##fre1
merged = pd.DataFrame()
merged['a pinene']= apinene
merged['octane'] = octane

def rn(i):
    try: return rename[i]; 
    except:return i

merged.index= [ rn(i) for i in merged.index]

ax = merged.plot(kind='barh')
ax.set_xlabel('Frequency of functional group')
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
