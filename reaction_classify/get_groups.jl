f = open("organic.kpp")
string = replace(readstring(f),r"\s","")
close(f)


matchall(r,str)

print(string)


#=
m=match(r"(?P<hour>\d+):(?P<minute>\d+)","12:45")
RegexMatch("12:45", hour="12", minute="45")
julia> m[:minute]
"45"
=#