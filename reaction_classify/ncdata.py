import netCDF4,re
from netCDF4 import Dataset



def get(filename,grp=0):
    nc = Dataset(filename,'r')
    print nc.date, '\n', nc.description,'\n'
    print 'Select Simulation: \n\n'
    for i,g in enumerate(nc.groups): print i , ' - ', g
    group = tuple(nc.groups)[grp]#[int(input('Enter Number \n'))]
    print group, 'took', nc.groups[group].WALL_time, 'seconds to compute.'


    specs = nc.groups[group].variables['Spec'][:]
    specs_columns = nc.groups[group].variables['Spec'].head.split(',')
    rates = nc.groups[group].variables['Rate'][:]
    rates_columns = nc.groups[group].variables['Rate'].head.split(',')

    nc.close()

    di= dict([[specs_columns[i],i] for i in xrange(len(specs_columns))])

    print 'returning'

    return {'spec':specs,'rate':rates,
    'sc':specs_columns,'rc':rates_columns,
    'dict': di
    }

'''
def carbonlist():
    import pandas as pd
    df =  pd.read_csv('smiles_mined.csv')
    cs= re.compile(r'c',re.IGNORECASE)
    def check(x): 
        try:
            if len(cs.findall(x)) >0 : 
                return True
        except:None    
        return False
        
    df['c']=[check(i) for i in df.smiles]
    
    df.name[df.c].to_csv('carbons.csv')
    
    '''