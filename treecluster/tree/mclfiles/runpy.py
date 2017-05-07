import os,multiprocessing,time



def function(x):
    return os.system('`~/local/bin/mcl mcl%03d.input --abc -o out.%03d -I 2.5`'%(x,x))


for x in xrange(0,286,2):
    function(x)
    time.sleep(10)
    print x
