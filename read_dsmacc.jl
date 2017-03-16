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




using NetCDF
filename = "ropa_out.nc"

println(ncinfo( filename ))


using PyCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata


http://dataframesjl.readthedocs.io/en/latest/getting_started.html
