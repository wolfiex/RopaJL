data = tuple(open('smartslist.txt'))

old = ''
smarts = []
for i in data:
    if '[' == i[0] : smarts.append([i.strip('\n'),old.split('.')[0]])
    old=i.replace('\n','')
    
smarts


from rdkit import Chem
from rdkit.Chem import Draw
import pandas as pd
import numpy as np


df = pd.read_csv('smiles_mined.csv')


groups = []

for i in np.array(df.inchi):
    try:
        dummy =[]
        mol = Chem.MolFromInchi(i)
        for j in smarts:
            try:
                fgsmart = Chem.MolFromSmarts(j[0])
                if len(Chem.Mol.GetSubstructMatches(mol, fgsmart, uniquify=True))>0:
                    dummy.append(j[1])
            except: None
            
        groups.append(dummy)    
    except: 
        groups.append(dummy)
            


    def getimages():
        for i in df.iterrows():
            try:
                
                mol = Chem.MolFromInchi(i[1].inchi)
                Draw.MolToFile(mol,'images/'+i[1]['name']+'.svg')
            except:None
            
            
            
        
        