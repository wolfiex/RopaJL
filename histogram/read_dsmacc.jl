#=

include("./read_dsmacc.jl")

using blink
w = Blink.AtomShell.Window()
loadurl(w, string("file://" ,pwd(),"/scatter3d/index.html"))
@js w console.log("You have succesfully loaded index.html from Julia")

=#

len = length
normalise(x) = x/norm(x)
run() = eval(parse("""include("./read_dsmacc.jl")"""))
evlstr(x) = eval(parse(x))

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

node_set = Set([ i[2:len(i)-1] for i in matchall(r"[\n+>-]{1}[A-z0-9]+[\n+>-]{1}",joint) ])
nodes = [i for i in node_set]
dict = Dict( [[i,x] for (x,i) in enumerate(nodes)])

flux = []
edges = []
for i in 1:length(reactants)
  rcol=[]
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
#using Blink
#w = Blink.Window()
sleep(1)


t=144
#using Plots
#unicodeplots();

#f4(x)=log(e,x),

fns=[f(x)=x,f1(x)=x*x, f2(x)=x*x*x, f3(x)=e^x, f5(x)=1/x,f6(x)=1/x^2,f7(x)=1/x^e]

forward = []
for fn in 1:len(fns)
  bindata = []
  for t in 1:7:len(flux[1])

      links = filter(i -> flux[i][t]>0 , 1:len(flux))
      tflux = [log10(flux[i][t]) for i in links]
      weight = (tflux+abs(minimum(tflux)))
      weight = (weight/maximum(weight))*.98 +0.01

      weight = [fns[fn](q) for q in weight]

      a = fit(Histogram, weight+0.1, nbins = 10, closed = :left)

      println(a.weights,[i for i in a.edges[1]])

      push!(bindata,a.weights)
  end
  push!(forward,bindata)
end


open("data.json", "w") do f
        write(f, "bardata="*JSON.json(forward)*"; timestamp ="*JSON.json(specs[1][2:len(specs[1])]))
     end








#R"bin<- data.frame($(bindata));colnames(bin) <- NULL"

using Blink
w = Blink.AtomShell.Window()
loadurl(w, string("file://" ,pwd(),"/index.html"))
@js w console.log("You have succesfully loaded index.html from Julia")



#http://dataframesjl.readthedocs.io/en/latest/getting_started.html
#https://gist.github.com/gizmaa/7214002
