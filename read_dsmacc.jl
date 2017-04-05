#=

 include("./read_dsmacc.jl")

Lets utilise some old code
Conda.add("NetCDF4")
Conda.update()


Pkg.add("PyCall")
Pkg.add("DataFrames")


SymPy.jl

using blink
w = Blink.AtomShell.Window()

loadurl(w, string("file://" ,pwd(),"/scatter3d/index.html"))
@js w console.log("You have succesfully loaded index.html from Julia")
@js w window.nodes = $nodes

Pkg.clone("Pandas")
using Pandas

=#

println(ARGS);



len = length


using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
filename = "dsmacc_out.nc"
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
#=
products[789]
1-element Array{SubString{UTF8String},1}:
"DUMMY"

=#


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
        push!(edges,[j,l,i])
    end

  end
end





##################FOR EACH TIMESTEP##################
@pyimport nx
#using Blink
#w = Blink.Window()
sleep(10)


t=144
#using Plots
#unicodeplots();


for t in 1:100:288

    println(t)
    nx.newGraph()
    normalise(x) = x/norm(x)


    links = filter(i -> flux[i][t]>0 , 1:len(flux))
    tflux = [log10(flux[i][t]) for i in links]
    weight = 1+normalise(tflux)

    c= 0
    for i in links
        nx.addedge(edges[i][1],edges[i][2],weight[c+=1])
    end



    # initialize the attractor
    a =  a = nx.betweenness("weight")
    x = [try a[i] catch 0.0f0 end for i in nodes]
    a =  a = nx.eigenvector("weight")
    y = [try a[i] catch 0.0f0 end for i in nodes]
    a = nx.closeness("weight")
    z = [try a[i] catch 0.0f0 end for i in nodes]

    a = nx.betweenness("weight")
    k = [try a[i] catch 0.0f0 end for i in nodes]

    #=
    # initialize a 3D plot with 1 empty series
    plt = path3d(1, xlim=(0,1), ylim=(0,1), zlim=(0,1),
                    xlab = "eigenvector", ylab = "betweenness", zlab = "closeness",
                    title = "Centrality ", marker = 1)

    # build an animated gif, saving every 10th frame
    @gif for i=1:length(z)
        push!(plt, x[i], y[i], z[i])
    end #every 1
    =#


#=
using Blink
w = Blink.Window()


    loadurl(w, string("file://" ,pwd(),"/scatter3d/index.html"))
        sleep(1)
    @js w console.log("You have succesfully loaded index.html from Julia")
    sleep(1)
    @js w window.nodes = $nodes
    @js w window.x = $x

    @js w window.y = $k

    @js w window.z = $z
    @js w run()
    sleep(1)
    t2 = "centrality_" * lpad(t,4,0)
    @js w save($t2)
=#


a = nx.triads()
#b = names!(DataFrame(transpose(a["data"])),[Symbol(i) for i in a["nodes"]])

#Set([i[1:3] for i in a["key"]])

b = names!(DataFrame(a["data"]),[Symbol(i) for i in a["key"]])
maxnet = [Symbol(i) for i in filter(k->k[3]=='1', a["key"])]

mn = b[maxnet]

sum =[]
for i in 1:size(mn)[1]
  dummy = 0
  for j in 1:len(mn)
      dummy+= mn[i,j]
  end
  push!(sum,dummy)
end


d = sort(collect(Dict(a["nodes"],sum)),by=x->x[2])

for i in len(d)-10:len(d)
  println( " Species: $(d[i][1]) - Count: $(d[i][2]) ")
end

#=

unicodeplots();
plot(sum, label="$t", xlabel="Species Index", ylabel="Open Count")

a["nodes"][filter(x->b[Symbol("030C")][x]>0, 1:len(b))]



=#

end


#http://dataframesjl.readthedocs.io/en/latest/getting_started.html
#https://gist.github.com/gizmaa/7214002
