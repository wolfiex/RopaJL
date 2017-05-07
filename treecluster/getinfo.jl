
len = length

using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
filename = "nhept33.nc"
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






f = open("mclsaved.out","w")


for t in 1:len(specs[1])


  links = filter(i -> flux[i][t]>0 , 1:len(flux))
  tflux = [log10(flux[i][t]) for i in links]
  weight = 1+normalise(tflux)

  source = [i[1] for i in edges]
  target=[i[2] for i in edges]
  weighted = [weight[i[3]] for i in edges]

  @rput source
  @rput target
  @rput weighted

  R"library(igraph)"

  R"el <- structure(list(V1 = source, V2 = target, weight = weighted), .Names = c('V1',
  'V2', 'weight'), class = 'data.frame', row.names = c(1:$(length(edges))
  ))"

  R"g <- graph.data.frame(el)"

  R"net = g"

  label = R"a = cluster_spinglass(g, spins=50)"


  print(t)

  for i in 1:length(label)
    R"str = paste(unlist(a[$i]),collapse='\t')"
    @rget str
    if str != ""
      write(f,str)
      write(f,",")
    end
  end
  write(f,"\n")
end
close(f)
