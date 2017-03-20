#=

 include("./read_dsmacc.jl")

Lets utilise some old code
Conda.add("NetCDF4")
Conda.update()


Pkg.add("PyCall")
Pkg.add("DataFrames")


SymPy.jl

=#
println(ARGS);



len = length


using PyCall,DataFrames
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
  println(i)
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
t=144
using Plots
unicodeplots();

test = false





for t in [144,180,216]#[36,72,144,180,216,288]
  nx.newGraph()
  normalise(x) = x/norm(x)


  links = filter(i -> flux[i][t]>0 , 1:len(flux))
  tflux = [log10(flux[i][t]) for i in links]
  weight = 1+normalise(tflux)

  c= 0
  for i in links
      nx.addedge(edges[i][1],edges[i][2],weight[c+=1])
      println(c)
  end

  nx.p()


  a = nx.eigenvector("none")
  b = [try a[i] catch 0.0f0 end for i in nodes]

  a1 = nx.eigenvector()
  b1 = [try a1[i] catch 0.0f0 end for i in nodes]

  difference = [abs(i) for i in (b-b1)]
  difference= [difference[i]/(b[i]+1e-9) for i in 1:len(b)]

if test
  plot!(
      difference,

      label  = "$t",
      ylabel = "Eigenvector Centrality",
      xlabel = "Species Index",

      title  = "Unicode plots: Eigen-centrality Comparison",
      xrotation = rad2deg(pi/3),
      )


else
    plot(
        difference,

        label  = "$t",
        ylabel = "Eigenvector Centrality",
        xlabel = "Species Index",

        title  = "Unicode plots: Eigen-centrality Comparison",
        xrotation = rad2deg(pi/3),
        )

end


  test=true

end

plot!()





#http://dataframesjl.readthedocs.io/en/latest/getting_started.html
