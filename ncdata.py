import netCDF4
from netCDF4 import Dataset


nc = Dataset('dsmacc_out.nc','r')
print nc.date, '\n', nc.description,'\n'
print 'Select Simulation: \n\n'
for i,g in enumerate(nc.groups): print i , ' - ', g
group = tuple(nc.groups)[int(input('Enter Number \n'))]
print group, 'took', nc.groups[group].WALL_time, 'seconds to compute.'


specs = nc.groups[group].variables['Spec'][:]
specs_columns = nc.groups[group].variables['Spec'].head.split(',')
rates = nc.groups[group].variables['Rate'][:]
rates_columns = nc.groups[group].variables['Rate'].head.split(',')


nc.close()
