using RCall

#install.packages("rgexf", dependencies=TRUE)
R"library(igraph);library(rgexf)"
R"g = gexf.to.igraph(read.gexf('MCMPOSTER.gexf'))"
R"weights = E(g)$weight" 
R"weights = (weights-min(weights))"
R"E(g)$weight= weights/max(weights)" 

 R"""undirected = function(x){  
     if (length(x)==1) {  return(x[1])}  
     else if (length(x)>2) {stop('Too many variables, use igraphs simplify function')}
     else {return(abs(x[1]-x[2]))}
         }"""#makes graph undirected

R"g = simplify(g, edge.attr.comb='sum')"
R"g = as.undirected(g, mode = c('collapse'),  edge.attr.comb = undirected)"
     

    
R"write_graph(g, 'mcl.input', 'ncol')"  

      
    
cmd =  `/Users/$(ENV["USER"])/local/bin/mcl mcl.input --abc -o mcl.out -I 1.4`    
run(   cmd  )
     
     
f = open("mcl.input")
s = readstring(f)
close(f)

using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata

filename = "./dunmcm.nc"

data = ncdata.get(filename,grp=0)
specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])
specs = specs[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["sc"])]]

t = 216





R"v = V(g)$name"
@rget v

vv= [specs[Symbol(i)][t] for i in v ]
@rput vv
R"v = log10(vv)"
R"v= (v+abs(min(v)))"
R"v=1e-10 + v/max(v)"
R"V(g)$conc = v"

#=
for i in v
ii = "z"*i
R"g=g+vertex($(ii), conc=0)" 
R"g = g + edge($(ii), $(i), weight =1000000)"
end
=#


R"""g1.gexf <- igraph.to.gexf(g)
f <- file('mcmspheres.gexf')
writeLines(g1.gexf$graph, con = f)
close(f)
"""










data = split(s,"\n")
pop!(data)

'''
data = [push!(split(i," "),"Borneo MCM") for i in data]
open("reactionedges.json", "w") do f
        write(f, replace(JSON.json(data),r"\"(\d+\.\d+)\"",s"\1"))
     end
    ''' 

     
     
     
     
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