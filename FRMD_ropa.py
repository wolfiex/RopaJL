
using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
len = length
filename = "./reaction_classify/cri2_nhept.nc"

data = ncdata.get(filename)
specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])
rates = names!(DataFrame(data["rate"]),[Symbol(i)for i in data["rc"]])
rates = rates[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["rc"])]]
specs = specs[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["sc"])]]
rates = rates[7:len(rates)]
rates = rates[:,[Symbol(i) for i in filter(x->sum(rates[x])>0,names(rates))]]
joint = "\n"*(join(names(rates),"\n"))*"\n"

products= [split(i[4:len(i)],"+") for i in matchall(r"-->([A-z0-9+]*)",joint)]
reactants = [split(i[2:len(i)-1],"+") for i in matchall(r"\n([A-z0-9+]{1,60})([-->]{0,1})",joint)]

node_set = Set([ i[2:len(i)-1] for i in matchall(r"[\n+>-]{1}[A-z0-9]+[\n+>-]{1}",joint) ])
nodes = [i for i in node_set]
dict = Dict( [[i,x] for (x,i) in enumerate(nodes)])

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



function sorteqn(x,delim)
    r,p = split(string(x),delim)
    r = join(sort(split(r,'+')),'+')
    p = join(sort(split(p,'+')),'+')
    return join([r,p],delim)
end

rateeqn = [Symbol(sorteqn(i,"-->")) for i in names(rates)]




t = 144



links = filter(i -> flux[i][t]>0 , 1:len(flux))
tflux = [log10(flux[i][t]) for i in links]
weight =  tflux - minimum(tflux)
weight = 1 - weight/maximum(weight)

#1+normalise(tflux)

newflux = [flux[i][t] for i in 1:len(flux)]
counter = 0
for i in links
  newflux[i] = weight[counter+=1]
end


edge = filter(i -> newflux[i[3]]>0 , edges)
source = [i[1] for i in edge]
target=[i[2] for i in edge]
weighted = [newflux[i[3]]+0.0001 for i in edge]



novalues = [i>0. for i in Array(specs[t,:])]
novalues = Set([string(i) for i in names(specs)[novalues]])



     @rput source
     @rput target
     @rput weighted

     R"library(igraph)"

     R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
     'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edge))
     ))"

     R"g <- graph.data.frame(el)"


 #if as undirected:


 R"""undirected = function(x){
     if (length(x)==1) {  return(x[1])}
     else if (length(x)>2) {stop('Too many variables, use igraphs simplify function')}
     else {return(abs(x[1]-x[2]))}
         }"""#abs(x[1]-x[2]))}"
#makes graph undirected

R"g = simplify(g, edge.attr.comb='sum')"
R"g = as.undirected(g, mode = c('collapse'),  edge.attr.comb = undirected)"

 R"weights = E(g)$weight"

R"E(g)$weight = weights/max(weights)"


R"net=g"

#remove non carbons

smiles =readtable("./reaction_classify/carbons.csv")
smiles = Set(smiles[:species])
 R"v = V(g)$name"
 @rget v
 v=Set(v)
 # to remove carbons comment below
 #smiles = Set()

 smiles = intersect(smiles,novalues)

 diff = [i for i in setdiff(v,smiles)]


 @rput diff
 R"g = delete.vertices(g,diff)"


R"net = g"




hubs = R"hub_score(net)$vector"
authorities = R"authority_score(net, weights=NA)$vector"

indegree = R"degree(net, mode='in')"
outdegree = R"degree(net, mode='out')"
closeness = R"closeness(net, mode='all')# ,weights=NA)"
ec = R"eigen_centrality(net, directed=TRUE, weights=E(net)$weight)$vector"
#betweenness = R"betweenness(net, directed=T)"








 df = DataFrame()
 df[Symbol("")] = [string(i) for i in names(hubs)]
df[Symbol("Concpure"*string(t))] = [specs[t,i] for i in names(hubs)]
df[Symbol("Conc"*string(t))] = [log10(specs[t,i]) for i in names(hubs)]
 df[Symbol("Hubs"*string(t))] = [hubs[i] for i in names(hubs)]
 df[Symbol("Authorities"*string(t))] = [authorities[i] for i in names(hubs)]
 df[Symbol("InDeg"*string(t))] = [indegree[i] for i in names(hubs)]
 df[Symbol("OutDeg"*string(t))] = [outdegree[i] for i in names(hubs)]
 df[Symbol("Closeness"*string(t))] = [closeness[i] for i in names(hubs)]
 df[Symbol("Eigenvector"*string(t))] = [ec[i] for i in names(hubs)]
 writetable("output.csv", df)







 t = 144+72



 links = filter(i -> flux[i][t]>0 , 1:len(flux))
 tflux = [log10(flux[i][t]) for i in links]
 weight =  tflux - minimum(tflux)
 weight = 1 - weight/maximum(weight)

 #1+normalise(tflux)

 newflux = [flux[i][t] for i in 1:len(flux)]
 counter = 0
 for i in links
   newflux[i] = weight[counter+=1]
 end


 edge = filter(i -> newflux[i[3]]>0 , edges)
 source = [i[1] for i in edge]
 target=[i[2] for i in edge]
 weighted = [newflux[i[3]]+0.0001 for i in edge]



 novalues = [i>0. for i in Array(specs[t,:])]
 novalues = Set([string(i) for i in names(specs)[novalues]])



      @rput source
      @rput target
      @rput weighted

      R"library(igraph)"

      R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
      'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edge))
      ))"

      R"g <- graph.data.frame(el)"


  #if as undirected:


  R"""undirected = function(x){
      if (length(x)==1) {  return(x[1])}
      else if (length(x)>2) {stop('Too many variables, use igraphs simplify function')}
      else {return(abs(x[1]-x[2]))}
          }"""#abs(x[1]-x[2]))}"
 #makes graph undirected

 R"g = simplify(g, edge.attr.comb='sum')"
 R"g = as.undirected(g, mode = c('collapse'),  edge.attr.comb = undirected)"

  R"weights = E(g)$weight"

 R"E(g)$weight = weights/max(weights)"


 R"net=g"

 #remove non carbons

 smiles =readtable("./reaction_classify/carbons.csv")
 smiles = Set(smiles[:species])
  R"v = V(g)$name"
  @rget v
  v=Set(v)
  # to remove carbons comment below
  #smiles = Set()

  smiles = intersect(smiles,novalues)

  diff = [i for i in setdiff(v,smiles)]


  @rput diff
  R"g = delete.vertices(g,diff)"


 R"net = g"




 hubs = R"hub_score(net)$vector"
 authorities = R"authority_score(net, weights=NA)$vector"

 indegree = R"degree(net, mode='in')"
 outdegree = R"degree(net, mode='out')"
 closeness = R"closeness(net, mode='all')# ,weights=NA)"
 ec = R"eigen_centrality(net, directed=TRUE, weights=E(net)$weight)$vector"
 #betweenness = R"betweenness(net, directed=T)"


df[Symbol("Concpure"*string(t))] = [specs[t,i] for i in names(hubs)]
df[Symbol("Conc"*string(t))] = [log10(specs[t,i]) for i in names(hubs)]
 df[Symbol("Hubs"*string(t))] = [hubs[i] for i in names(hubs)]
 df[Symbol("Authorities"*string(t))] = [authorities[i] for i in names(hubs)]
 df[Symbol("InDeg"*string(t))] = [indegree[i] for i in names(hubs)]
 df[Symbol("OutDeg"*string(t))] = [outdegree[i] for i in names(hubs)]
 df[Symbol("Closeness"*string(t))] = [closeness[i] for i in names(hubs)]
 df[Symbol("Eigenvector"*string(t))] = [ec[i] for i in names(hubs)]
 writetable("output.csv", df)
