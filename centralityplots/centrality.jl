
len = length

using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
filename = "dsmacc_out.nc"
filename = "../methane.nc"
data = ncdata.get(filename)

specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])
rates = names!(DataFrame(data["rate"]),[Symbol(i)for i in data["rc"]])

rates = rates[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["rc"])]]
specs = specs[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["sc"])]]

rates = rates[7:len(rates)]
rates = rates[:,[Symbol(i) for i in filter(x->sum(rates[x])>0,names(rates))]]

# reading in data and cleaning
joint = "\n"*(join(names(rates),"\n"))*"\n"

products= [split(i[4:len(i)],"+") for i in matchall(r"-->([A-z0-9+]*)",joint)]
reactants = [split(i[2:len(i)-1],"+") for i in matchall(r"\n([A-z0-9+]{1,60})([-->]{0,1})",joint)]

node_set = Set([ i[2:len(i)-1] for i in matchall(r"[\n+>-]{1}[A-z0-9]+[\n+>-]{1}",joint) ])
nodes = [i for i in node_set]
dict = Dict( [[i,x] for (x,i) in enumerate(nodes)])

#df = DataFrame(source = Char[], target = Char[], weight = Float16[])

flux = []
edges = []
for i in 1:length(reactants)
  rcol=[]
  #println(i)
  for j in reactants[i]
    coeff = match( r"([\d\s\.]*)(\D[\d\D]*)", j)
    dummy = specs[Symbol(coeff[2])]
    try
      push!(rcol,parse(Float32,coeff[1]))
    catch
      push!(rcol,1.0f0)
    end

    prod = 1
    for k in rcol
      prod*=k
    end


    push!(flux, prod*rates[i])
    # make edges array
    for l in products[i]
        push!(edges,[match( r"([\d\s\.]*)(\D[\d\D]*)", j)[2],match( r"([\d\s\.]*)(\D[\d\D]*)", l)[2],i])
    end

  end
end


normalise(x) = x/norm(x)
t = 180


links = filter(i -> flux[i][t]>0 , 1:len(flux))
tflux = [log10(flux[i][t]) for i in links]
weight = 1+normalise(tflux)

source = [i[1] for i in edges]
target=[i[2] for i in edges]
weighted = [weight[i[3]] for i in edges]


links = filter(i -> flux[i][t]>0 , 1:len(flux))
tflux = [log10(flux[i][t]) for i in links]
weight = 1+normalise(tflux)

newflux = [flux[i][t] for i in 1:len(flux)]
counter = 0
for i in links
  newflux[i] = weight[counter+=1]
end


edge = filter(i -> newflux[i[3]]>0 , edges)
source = [i[1] for i in edge]
target=[i[2] for i in edge]
weighted = [newflux[i[3]]+0.0001 for i in edge]




@rput source
@rput target
@rput weighted

R"library(igraph)"

R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edges))
))"

R"g <- graph.data.frame(el)"

R"net = g"


density = R"ecount(net)/(vcount(net)*(vcount(net)-1))"#edge_density(net, loops=F)"


ec = R"eigen_centrality(g, directed=TRUE, weights=E(g)$weight)$vector"

#liklyhood of returned pairs. reciprocity
reciprocity = R"reciprocity(net)"
# # Mutual, asymmetric, and null node pairs
#2*dyad_census(net)$mut/ecount(net) # Calculating reciprocity

transivity_global = R"transitivity(net, type='global')"# net is treated as an undirected networktransitivity(as.undirected(net, mode="collapse")) # same as above

trasivity_pernode = R"transitivity(net, type='local')"

triad_census =R"triad_census(net)"


diameter = R"diameter(net, directed=T)" #longest shortest path

diameter_nodes = R"get_diameter(net, directed=T)"

degree = R"degree(net, mode='all')"


deg_dist= R"degree_distribution(net, cumulative=T, mode='all')"#plot 0:max(degree) against 1-this

indegree = R"degree(net, mode='in')"
indegree_centralisation = R"centr_degree(net, mode='in', normalized=T)"

outdegree = R"degree(net, mode='out')"
outegree_centralisation = R"centr_degree(net, mode='out', normalized=T)"

closeness = R"closeness(net, mode='all')# ,weights=NA)"
closeness_centalisation =R"centr_clo(net, mode="all", normalized=T)"

ec = R"eigen_centrality(net, directed=TRUE, weights=E(net)$weight)$vector"
ec_centralisation = R"centr_eigen(net, directed=TRUE, normalized=T)"

betweenness = R"betweenness(net, directed=T)"
betweenness_edge = R"edge_betweenness(net, directed=T)"
betweenness_centralisation = R"centr_betweenness(net, directed=T)"

hubs = R"hub_score(net)$vector"
authorities = R"authority_score(net, weights=NA)$vector"

mean_distance = R"mean_distance(net, directed=T)"
all_shortest = R"distances(net)"

cocitation = R"cocitation(net)"

#######subgrahs and cliwues

R"net.sym <- as.undirected(net, mode= "collapse",edge.attr.comb=list(weight="sum", "ignore"))"#sum weight ignore all other attr
print("maybe dont sum edges but subtract?")

cliques = R"cliques(net.sym)"
cliques_sizes= R"sapply(cliques(net.sym), length)"
cliques_largest=R"largest_cliques(net.sym)"

###commmunity detection
#make membership a function

edge_betweenness =R"cluster_edge_betweenness(net)"#dendPlot(ceb, mode="hclust")
#edge_betweenness_classification = R"membership($(edge_betweenness))"
#modularity(ceb)
#crossing(ceb, net) # boolean vector: TRUE for edges across communities

kcore = R"coreness(net, mode="all")"

assortativity_degree = R"assortativity_degree(net, directed=T)"

pagerank= R"page_rank(g, algo = c('prpack', 'arpack', 'power'), vids = V(g),
     directed = TRUE, damping = 0.85, personalized = NULL, weights = NULL,
     options = NULL)$vector"

####clustering below:


label = R"a = cluster_label_prop(net)"
label = R"a = cluster_walktrap(g,step= 20000 )"
label = R"a = cluster_spinglass(g, spins=200)"
label = R"a = cluster_optimal(g)"

#label = R"a = cluster_louvain(as.undirected(net, mode= "collapse",edge.attr.comb=list(weight="mean", "ignore")))"
#label = R"a = cluster_leading_eigen(g, steps = -1, weights = NULL, start = NULL,  options = arpack_defaults, callback = NULL, extra = NULL,  env = parent.frame())"

label = R"a = cluster_edge_betweenness(g, weights = E(g)$weight, directed = TRUE,
  edge.betweenness = TRUE, merges = TRUE, bridges = TRUE,
  modularity = TRUE, membership = TRUE)"



f = open("julia.out","w")
for i in 1:length(label)
R"str = paste(unlist(a[$i]),collapse='\t')"
@rget str
if str != ""
write(f,str)
write(f,"\n")
end
end
close(f)




function cent(x)

  f = open("centrality.out","w")
  write(f,[string(i)*" " for i in names(x)])
  write(f,"\n")
  write(f,[string(x[i])*" " for i in 1:length(x)])
  close(f)

end







#=

We can extract the distances to a node or set of nodes we are interested in. Here we will get the
distance of every media from the New York Times.
dist.from.NYT <- distances(net, v=V(net)[media=="NY Times"], to=V(net), weights=NA)
 Set colors to plot the distances:
oranges <- colorRampPalette(c("dark red", "gold"))
col <- oranges(max(dist.from.NYT)+1)
col <- col[dist.from.NYT+1]
plot(net, vertex.color=col, vertex



We can also find the shortest path between specific nodes. Say here between MSNBC and the New
York Post:
news.path <- shortest_paths(net,
from = V(net)[media=="MSNBC"],
to = V(net)[media=="New York Post"],
output = "both") # both path nodes and edges
# Generate edge color variable to plot the path:
ecol <- rep("gray80", ecount(net))
ecol[unlist(news.path$epath)] <- "orange"
# Generate edge width variable to plot the path:
ew <- rep(2, ecount(net))
ew[unlist(news.path$epath)] <- 4
# Generate node color variable to plot the path:
vcol <- rep("gray40", vcount(net))
vcol[unlist(news.path$vpath)] <- "gold"
plot(net, vertex.color=vcol, edge.color=ecol,
edge.width=ew, edge.arrow.mode=0)

=#
