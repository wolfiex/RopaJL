
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

     @rput source
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
     smiles = intersect(smiles,values)
     diff = [i for i in setdiff(v,smiles)]
     
    #diff = [i for i in intersect(v,Set(vcat(["NO","NO2","NO3","OH","O3","O","HONO","HO2","H2O2","HSO3","H2","HNO3","HO2NO2","HSO3","N2O5","SO2","SO3","SA"],novalues)))]
     
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
     



print("fini")

     
     