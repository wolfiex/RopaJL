from networkx import *
import json
import networkx as nx
from networkx.readwrite import json_graph


global G
G=DiGraph()


def edges():
    print list(G.edges_iter(data='weight', default=-999))

def newGraph():
    global G
    G=DiGraph()

def addedge(s,t,w):
    global G
    G.add_edge(s,t,weight=w)

def savejson():
    global G
    json.dump(json_graph.node_link_data(G), open('force.json','w'))


def p ():
    global G
    print G.graph, G.nodes()

def eigenvector(w='weight'):
    return nx.eigenvector_centrality(G,weight=w)
