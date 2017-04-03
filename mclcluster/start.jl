#=
run(`$(ENV["HOME"])/local/bin/mcl`)
run(`~/local/mcl test.data --abc -o out.cathat -I 10`)
=#

using PyCall,DataFrames
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
filename = "ropa_g_nhept.nc"

