##### run in console, interactive does not work for some reason



using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
len = length
filename = "./methane.nc"

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


################READ CATEGORIES##################
dict = Dict()
open("edgecat.json", "r") do f
    global dict
    dict=JSON.parse(readstring(f))  # parse and transform data
end



dict = Dict(Symbol( sorteqn( replace(key,"=","-->") , "-->" )) => value for (key, value) in dict)

reactiontypes= [try dict[i]; catch err; "missing" end  for i in rateeqn]


smiles =DataFrame(readtable("smiles_mined.csv"))


t = 325



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
grouping  = [reactiontypes[i[3]] for i in edge]



JSONdata =  [(i[1],i[2],newflux[i[3]],reactiontypes[i[3]]) for i  in edge]


jsondict = JSON.json(JSONdata)

open("reactionedges.json", "w") do f
        write(f, jsondict)
     end



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

R"write_graph(g, 'mcl.input', 'ncol')"

cmd =  `/Users/$(ENV["USER"])/local/bin/mcl mcl.input --abc -o mcl.out -I 2.5`
run(   cmd  )

     #=
n = 100 # length(names(specs))

label = R"a = cluster_optimal(g,weights=weights)"

f = open("spinglass.out","w")
for i in 1:length(label)
R"str = paste(unlist(a[$i]),collapse='\t')"
@rget str
if str != ""
write(f,str)
write(f,"\n")
end
end
close(f)

println("spinglass")
=#
print("fini")
