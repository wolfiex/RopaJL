import pandas as pd
import re 


global matches, matchesre,specs,df
matches = ['ACID','CO3H','CO2H','OOH','CO3','NO3','CHO','O2','OH']

contains =['PAN','GLYOX'] 

matchesre = [re.compile(r".*"+i) for i in matches]

def name(**variables):
    return [x for x in variables]

def to_groups (x):
    for i in contains:
         if i in x: return i
    for i in xrange(len(matches)):
        if re.match(matchesre[i],x): return matches[i]
    
    if 'ACR' in x: return 'ACR'
    if x[-1]== 'O': return 'O'
    
    if 'OO' in x: return 'crigee'
    
    return x + '-'
    
specs =[]




def get(folder,num,
getspecs = False):

    data = [re.findall(r'[^\s]+',i) for i in tuple(open(folder +'/sorted/%2f.txt'%num))]
    
    for i in data:
        if len(i)==1: 
            try:
                group = int(i[0])
            except: 
                if getspecs:specs.extend(i)
                else:
                    df.loc[i[0],folder+str(num)] = group

                
        else:
            if getspecs:specs.extend(i)
            else:
                for j in i:
                    df.loc[j,folder+str(num)] = group


flow =9.0

get('lowlon144dun',flow,1)
df = pd.DataFrame(specs)
df.columns=['name']
df.index = df.name
df['sim'] = [to_groups(i) for i in df.name]


for i in ['lowlon144dun','lon144dun','LOwlon7273dun','lon7273dun']:
    get(i,flow)

print df.groupby(['sim']).size().sort_values(ascending=False)

meandf = df.groupby(['sim']).mean()
meandf.to_csv('comparemultigroup.csv')

import seaborn as sns
import matplotlib.pyplot as plt
ax =sns.heatmap(meandf.loc[filter(lambda x: '-' not in x,meandf.index),meandf.columns], annot=True, fmt=".1f")
plt.title('mean')
plt.show()

stdf = df.groupby(['sim']).std()
ax1 =sns.heatmap(stdf.loc[filter(lambda x: '-' not in x,stdf.index),stdf.columns], annot=True, fmt=".1f")
plt.title('std')
plt.show()