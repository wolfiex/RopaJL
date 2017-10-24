print 'hi'
print 34

 
 
print 5
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns; sns.set()


df = pd.read_csv('groupings.csv')

df['ngroups']= df.sum(axis=1)


ax = sns.heatmap(df)

plt.show()

print 333