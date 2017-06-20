using PyCall,DataFrames,RCall
unshift!(PyVector(pyimport("sys")["path"]), "")
@pyimport ncdata
len = length


function sorteqn(x,delim)
    r,p = split(string(x),delim)
    r = join(sort(split(r,'+')),'+')
    p = join(sort(split(p,'+')),'+')
    return join([r,p],delim)
end


organics = readtable("./mcm_3_3_1_reactions.csv", separator = ',', header = true)


reactions = map((x) -> vcat([join(matchall(r"[^\h]*",organics[x,4]),""),organics[x,2]]), 1:len(organics[1]))

organics[:reaction]=[sorteqn(i[1],"=") for i in reactions]

groups  =  [match(r"RO2NO\d?|RO2HO2|RO2|NO\d?|HO2|PAN|J",i[2]) for i in reactions]
allocations = [(r"\b(OH)\b","OH"),(r"\b(CH3O|HOCH2CH2O)\b","ALKOXYL"),(r"\b(HCOCO)\b","GLYOXL"),(r"\b(PPN)\b","PAN")]#[[regex,group]]


for i in 1:length(groups)
    groups[i] == nothing ? nothing : continue;
    rxn = split(reactions[i][1],'=')[1]
    groups[i] = match(r"\b(NO\d?|HO2)\b",rxn)

    if groups[i] == nothing

        for aloc in allocations
            if (ismatch( aloc[1] , rxn))
                groups[i] = aloc[2]
                @goto skip
            end
        end


        for j in split(rxn,"+")
            try
                if (ismatch(r"(\[O\-\]\[O\+\]\=C|\[C\]O\[O\]|\[O\]O\[C\])",mcm3[mcm3[:name].==j,:][:smiles][1]) )
                    groups[i] = "CRI"
                    @goto skip
                end
            catch
                groups[i] = "INORGANIC"
                @goto skip
            end
        end
        #print(reactions[i][1],groups[i],"\n")
        groups[i]="DISSOCIATION"
        @label skip
    end
end

function rmrx(i)
    try
        return i.match
    end
    return i
end

organics[Symbol("groups")]= [rmrx(i) for i in groups] #remove RegexMatch objects

allgroups = Set(organics[:groups])

###################
###################

eqnmatch = map((x)->ismatch(r"RO2|RO2NO2|RO2NO|RO2HO2|HO2",x),organics[:groups])

organics[Symbol("keep")]=eqnmatch

selection = organics[organics[:keep].==true,:]



matchingspecies = Set(matchall(r"\b\w+\b",join(selection[:reaction]," ")))





filename = "./edwards11.nc"

data = ncdata.get(filename)
specs = names!(DataFrame(data["spec"]),[Symbol(i)for i in data["sc"]])
rates = names!(DataFrame(data["rate"])[9:len(data["rc"])],[Symbol(i)for i in data["rc"][9:len(data["rc"])]])
#rates = rates[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["rc"])]]
specs = specs[:,[Symbol(i) for i in filter(x->!ismatch(r"EMISS|DUMMY",x),data["sc"])]]
rates = rates[:,[Symbol(i) for i in filter(x->sum(rates[x])>0,names(rates))]]
joint = "\n"*(join(names(rates),"\n"))*"\n"



selects = intersect(Set(names(specs)),Set([Symbol(x) for x in matchingspecies]))


rtype = map((x)-> organics[organics[:reaction].== replace(sorteqn(string(x),"-->"),"-->","="),:groups],names(rates))




products= [split(i[4:len(i)],"+") for i in matchall(r"-->([A-z0-9+]*)",joint)]
reactants = [split(i[2:len(i)-1],"+") for i in matchall(r"\n([A-z0-9+]{1,60})([-->]{0,1})",joint)]

node_set = Set([ i[2:len(i)-1] for i in matchall(r"[\n+>-]{1}[A-z0-9]+[\n+>-]{1}",joint) ])
nodes = [i for i in node_set]
dict = Dict( [[i,x] for (x,i) in enumerate(nodes)])


fluxtype = []
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

    push!(fluxtype, rtype[i])
    push!(flux, prod*rates[i])
    # make edges array
    for l in products[i]
        push!(edges,[match( r"([\d\s\.]*)(\D[\d\D]*)", j)[2],match( r"([\d\s\.]*)(\D[\d\D]*)", l)[2],i, fluxtype[i]])
    end

  end
end


newedges =  filter((x)-> ((Symbol(x[1]) in selects)&(  Symbol(x[2]) in selects)) , edges)

spcsel = "CH3COCH2O2"

newedges =  filter((x)-> (((x[1]) == spcsel)|(  (x[2]) == spcsel)) , newedges)

RO2NO = filter((x)-> x[4]==AbstractString["RO2NO"] , newedges)
RO2 = filter((x)-> x[4]==AbstractString["RO2"] , newedges)
HO2 = filter((x)-> x[4]==AbstractString["RO2HO2"] , newedges)


print("fini")
