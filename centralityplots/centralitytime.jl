
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
'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edge))
))"

R"g <- graph.data.frame(el)"

R"net = g"

# get node names !!!!
R"nodes = V(g)$name"
@rget nodes



trasivity_pernode = R"transitivity(net, type='local')"
triad_census =R"triad_census(net)"

degree = R"degree(net, mode='all')"
indegree = R"degree(net, mode='in')"
outdegree = R"degree(net, mode='out')"


closeness = R"closeness(net, mode='all')# ,weights=NA)"


ec = R"eigen_centrality(net, directed=TRUE, weights=E(net)$weight)$vector"
betweenness = R"betweenness(net, directed=T)"

hubs = R"hub_score(net)$vector"
authorities = R"authority_score(net, weights=NA)$vector"


pagerank= R"page_rank(g, algo = c('prpack', 'arpack', 'power'), vids = V(g),
     directed = TRUE, damping = 0.85, personalized = NULL, weights = NULL,
     options = NULL)$vector"

####clustering below:



f = open("centrality.out","w")


write(f,join(nodes,","))
write(f,"\n")

for t in 1:length(flux[1])


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

    R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
    'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edge))
    ))"
    R"g <- graph.data.frame(el)"
    R"net = g"


    #centrality = R"eigen_centrality(net, directed=TRUE, weights=E(net)$weight)$vector"
    centrality =R"betweenness(net, directed=T)"


write(f,join(centrality,","))
write(f,"\n")
end

close(f)
