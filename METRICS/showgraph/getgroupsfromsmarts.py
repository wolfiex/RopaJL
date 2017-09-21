data = tuple(open('smartslist.txt'))

old = ''
smarts = []
for i in data:
    if '[' in i : smarts.append([i,old])
    old=i