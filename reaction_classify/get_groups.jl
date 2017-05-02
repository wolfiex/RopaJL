using DataFrames, JSON

f = open("./organic.kpp")
string = replace(readstring(f),r"\h","")
close(f)



mcm3 = DataFrame(readtable("mcm3_3_1_species.csv",separator=',',header=true))

reactions =[vcat(split(i[1],":")) for i in eachmatch(r"\}(.*);",string)]
groups  =  [match(r"RO2NO\d?|RO2HO2|RO2|NO\d?|HO2|PAN|J",i[2]) for i in reactions]
allocations = [(r"\b(OH)\b","J"),(r"\b(CH3O|HOCH2CH2O)\b","ALKOXYL"),(r"\b(HCOCO)\b","GLYOXL"),(r"\b(PPN)\b","PAN")]#[[regex,group]]


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
        
        
        print(reactions[i][1],groups[i],"\n")        
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

groups = [rmrx(i) for i in groups] #remove RegexMatch objects


#
print("Groups are: \n", length(Set(groups)))
println(Set(groups))



#########
#convert into graph network links
dict = Dict()

for i in 1:length(groups)
    dict[reactions[i][1]] = groups[i]
end

jsondict = JSON.json(dict)

open("edgecat.json", "w") do f
        write(f, jsondict)
     end




println("\n'fini")

# arrays[1:end-3]
#=
m=match(r"(?P<hour>\d+):(?P<minute>\d+)","12:45")
RegexMatch("12:45", hour="12", minute="45")
julia> m[:minute]
=#



dict













