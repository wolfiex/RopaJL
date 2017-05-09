import ncdata
from pandas import * 
from matplotlib.pyplot import *

filename = "./mcm32_nhept.nc"
filename1 = "./cri2_nhept.nc"

spec=DataFrame(ncdata.get(filename)['spec'], columns = ncdata.get(filename)['sc'])
spec1=DataFrame(ncdata.get(filename1)['spec'], columns = ncdata.get(filename1)['sc'])

spec['NOx']= spec.NO + spec.NO2
spec1['NOx']= spec1.NO + spec1.NO2



p= spec[['O3','NOx','NC7H16','RO2']]
#p.plot()
p1= spec1[['O3','NOx','NC7H16','RO2']]
#p1.plot()



for i in p.columns:
    d = DataFrame()
    d['mcm_'+i]=spec[i]/spec.M
    d['cri_'+i]=spec1[i]/spec1.M
    d.plot()
    xlabel='timestep (sets of 10 min)'
    ylabel='Conc. Mixing Ratio'
    savefig(i+'.pdf')
    #show()
    
    
    
    