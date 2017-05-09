using PyCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
len = length
filename = "./mcm32_nhept.nc"
filename1 = "./cri2_nhept.nc"


data = ncdata.get(filename)
specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])

data = ncdata.get(filename1)
specs1 = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])

using Plots

spec = "O3"
plot(specs[Symbol(spec)])
plot!(specs1[Symbol(spec)])



print("fini")