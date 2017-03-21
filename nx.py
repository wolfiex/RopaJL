import json
import networkx as nwx
from networkx.readwrite import json_graph


global G
G=nwx.DiGraph()

global dummy

def edges():
    print list(G.edges_iter(data='weight', default=-999))

def newGraph():
    global G
    G=nwx.DiGraph()

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
    return nwx.eigenvector_centrality(G,weight=w)

def betweenness(w='weight'):
    return nwx.betweenness_centrality(G,weight=w)

def closeness(w='weight'):
    return nwx.closeness_centrality(G)

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
    import triadic as tr
    #census,
    global dummy
    census,node_census = tr.triadic_census(G)
    keys = node_census.values()[1].keys()
    ## Generate a table header
    print '| Node |', ' | '.join(keys)
    ## Generate table contents
    ## A little magic is required to convert ints to strings
    data = []
    for k in node_census.keys():
        #print '|', k ,'|',' | '.join([str(v) for v in node_census[k].values() ])
        data.append([k,[i for i in node_census[k].values()]])

    return {"key":keys,"data":[i[1] for i in data],"nodes":[i[0] for i in data]}

#https://networkx.github.io/documentation/networkx-1.10/reference/generated/networkx.algorithms.triads.triadic_census.html



def test():
    global G
    G = nwx.connected_component_subgraphs(G.to_undirected())
