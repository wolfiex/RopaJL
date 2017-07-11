using RCall

#install.packages("rgexf", dependencies=TRUE)
R"""
library(igraph)


el=read.csv('test.edgelist')   #file.choose()) # read the 'el.with.weights.csv' file 
g=graph.data.frame(el)


"""
#R"weights = E(g)$weight" 
#R"weights = (weights-min(weights))"
#R"E(g)$weight= weights/max(weights)"