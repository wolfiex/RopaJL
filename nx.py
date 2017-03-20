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

def betweenness(w='weight'):
    return nx.betweenness_centrality(G,weight=w)

def closeness(w='weight'):
    return nx.closeness_centrality(G)

def highest_centrality(centrality_function):
     """Returns a tuple (node,value) with the node
    with largest value from Networkx centrality dictionary."""
     # Create ordered tuple of centrality data
     cent_items=[(b,a) for (a,b) in centrality_function.iteritems()]
     # Sort in descending order
     cent_items.sort()
     cent_items.reverse()
     return tuple(reversed(cent_items[0]))

def triads():
    #import tradic
    census, node_census = nx.triadic_census(G)
    keys = node_census.values()[1].keys()
    ## Generate a table header
    print '| Node |', ' | '.join(keys)
    ## Generate table contents
    ## A little magic is required to convert ints to strings
    for k in node_census.keys():
        print '|', k, '|',' | '.join([str(v) for v in node_census[k].values()])


#https://networkx.github.io/documentation/networkx-1.10/reference/generated/networkx.algorithms.triads.triadic_census.html



def test():
    global G
    G = nx.connected_component_subgraphs(G.to_undirected())
