f = open("diesel.vna")
lines = readlines(f)

conc = filter(x-> ismatch(r"[\d\w]+\s[\d\.]+\s\d+\n",x),lines)

conc = [replace(i,"\n","") for i in conc]

conc = [split(i,r"\s") for i in conc]

cnc = Dict()

for i in conc
    cnc[i[1]]=i[2]
end


links = filter(x-> ismatch(r"[\d\w]+\s[\d\w]+\s[\.\d]+\n",x),lines)

links = [replace(i,"\n","") for i in links]

links = [split(i,r"\s") for i in links]

primary = filter(x-> ismatch(r"[\d\w]+\s[\d\.]+\s1\n",x),lines)

primary = [split(i,r"\s")[1] for i in primary]

println(primary)

close(f)

f = open("diesel.out")

nodes = readlines(f)

nodes = [replace(i,"\n","") for i in nodes]

nodes = [split(i,",") for i in nodes]

close(f)



open("tsne.json", "w") do f
        write(f, "{'nodes': [\n")

        for i in nodes
            if i == nodes[length(nodes)]
            write(f, "{'id': '$(i[1])', 'group': $(Int(i[1] in primary)),'x':$(i[2]),'y':$(i[3]),'value':$(cnc[i[1]])}\n")
            else
            write(f, "{'id': '$(i[1])', 'group': $(Int(i[1] in primary)),'x':$(i[2]),'y':$(i[3]),'value':$(cnc[i[1]])},\n")
            end

        end


        write(f, "],'links': [")

        for i in links
            if i == links[length(links)]
            write(f, "{'source': '$(i[1])', 'target': '$(i[2])', 'value':$(i[3])}\n")
            else
            write(f, "{'source': '$(i[1])', 'target': '$(i[2])', 'value':$(i[3])},\n")
            end
        end

        write(f, "]}")


     end

run(`ls`)
run(`perl -p -i -e "s/'/\"/g" tsne.json`)
