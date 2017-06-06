
using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
len = length
filename = "./dunmcm.nc"

data = ncdata.get(filename,grp=0)
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



smiles =readtable("carbons.csv")
smiles = Set(smiles[:species])

t = 216



links = filter(i -> flux[i][t]>0 , 1:len(flux))
tflux = [flux[i][t] for i in links] #[log10(flux[i][t]) for i in links]
weight =  tflux #- minimum(tflux)
#weight = 1 - weight/maximum(weight)

#1+normalise(tflux)

newflux = [flux[i][t] for i in 1:len(flux)]
counter = 0
for i in links
  newflux[i] = weight[counter+=1]
end


edge = filter(i -> newflux[i[3]]>0 , edges)
source = [i[1] for i in edge]
target=[i[2] for i in edge]
weighted = [newflux[i[3]] for i in edge]
#grouping  = [reactiontypes[i[3]] for i in edge]



val = [i>0. for i in Array(specs[t,:])]
values = Set([string(i) for i in names(specs)[val]])

novalues = !val
novalues = [string(i) for i in names(specs)[novalues]]





     @rput sourceed
     @rput target
     @rput weighted

     R"library(igraph)"
     R"library(rgexf)"

     R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
     'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edge))
     ))"

     R"g <- graph.data.frame(el)"
     
     

#c only 
     R"v = V(g)$name"
     @rget v
     v=Set(v)
     
     # to remove carbons comment below

     
     #comment if using smiles strings, else  keep commented
     #smiles = intersect(smiles,values)
     #diff = [i for i in setdiff(v,smiles)]
     
    diff = [i for i in intersect(v,Set(vcat(["NO","NO2","NO3","OH","O3","O","HONO","HO2","H2O2","HSO3","H2","HNO3","HO2NO2","HSO3","N2O5","SO2","SO3","SA"],novalues)))]
     
     @rput diff
     R"g = delete.vertices(g,diff)"
     
     
     R"g = simplify(g, edge.attr.comb='sum')"

      R"weights = log10(E(g)$weight)" 
      
      R"weights = (abs(min(weights))+weights)"   
      R"E(g)$weight = 1e-10 +weights" #"/max(weights)" 
         
         
     R"v = V(g)$name"
     @rget v
     
     
     
     v= [specs[Symbol(i)][t] for i in v ]
     
     
     
     @rput v
     
     R"v = log10(v)"
     R"v= (v+abs(min(v)))"
     R"v=1e-10 + v/max(v)"
     
     
     R"V(g)$conc = v"
     
R"""g1.gexf <- igraph.to.gexf(g)
f <- file('togephi.gexf')
writeLines(g1.gexf$graph, con = f)
close(f)
"""



'''
strength in 

library(Hmisc)
library(ggplot2)
require(reshape2)

Flux = strength(g,vids=V(g),mode=c("all"))
Flux = Flux_in/max(Flux_in)

Concentration = V(g)$conc



EigenCentrality = eigen_centrality(g, directed=TRUE, weights=E(g)$weight)$vector
EigenCentrality = EigenCentrality/max(EigenCentrality)

PageRank= page_rank(g, algo = c('prpack', 'arpack', 'power'), vids = V(g),
     directed = TRUE, damping = 0.85, personalized = NULL, weights = NULL,
     options = NULL)$vector
PageRank=PageRank/max(PageRank)

Betweenness=betweenness(net, directed=T)
Betweenness = Betweenness/max(Betweenness)

Hubs = hub_score(net)$vector
Authorities=authority_score(net, weights=NA)$vector


df = data.frame(Flux,EigenCentrality,PageRank,Betweenness,Authorities)

df1 <- melt(df ,  id.vars = 'Flux', variable.name = 'series')
df1$Value = df1$value


ggplot(df1, aes(Flux,Value)) + geom_point(aes(colour = series))+
geom_smooth(method='lm')




with(df1, qplot(Flux, Value, colour = series, shape = series, ) +
  geom_smooth(method='lm')    )
  
  
  
  df = data.frame(Concentration,EigenCentrality,PageRank,Betweenness,Authorities)

  df1 <- melt(df ,  id.vars = 'Concentration', variable.name = 'series')
  df1$Value = df1$value
  
  
  with(df1, qplot(Concentration, Value, colour = series, shape = series, )
    
    
  
  ggsave('plot.svg', plot = last_plot(), device = svg, path = NULL,
      scale = 1, width = 6, height = 2,
      dpi = 300, limitsize = FALSE,)

  
 
'''



print("fini")

     
     