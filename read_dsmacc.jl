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


using PyCall,DataFrames
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
filename = "dsmacc_out.nc"
data = ncdata.get(filename)

specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])
rates = names!(DataFrame(data["rate"]),[Symbol(i)for i in data["rc"]])

rates = rates[7:length(rates)]
rates = rates[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["rc"])]]
specs = specs[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["sc"])]]

rates = rates[:,[Symbol(i) for i in filter(x->sum(rates[x])>0,names(rates))]]

# reading in data and cleaning
joint = "\n"*(join(names(rates),"\n"))

products= [split(i[4:length(i)],"+") for i in matchall(r"-->([A-z0-9+]*)",joint)]
reactants= [split(i[2:length(i)-1],"+") for i in matchall(r"\n([A-z0-9+]{1,60})([-->]{0,1})",joint)]
#=
products[789]
1-element Array{SubString{UTF8String},1}:
"DUMMY"

=#


df = DataFrame(source = Char[], target = Char[], weight = Float16[])

flux = []
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

  end
end





http://dataframesjl.readthedocs.io/en/latest/getting_started.html
