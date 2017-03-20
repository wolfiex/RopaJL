#=
Pkg.add("Plots")
Pkg.add("PyPlot")
Pkg.add("GR")
Pkg.add("UnicodePlots")
Pkg.add("PlotlyJS")

=#
using Plots

unicodeplots();
plot(eq_values)


plot!(
    b,

    label  = "equation of time (calculated)",
    #line=(:black, 0.5, 6, :solid),

    #size=(800, 600),

    #xticks = (1:14:366, datestrings[1:14:366]),
    #yticks = -20:2.5:20,

    ylabel = "Minutes faster or slower than GMT",
    xlabel = "day in year",

    title  = "The Equation of Time",
    xrotation = rad2deg(pi/3),

    #fillrange = 0,
    #fillalpha = 0.25,
    #fillcolor = :lightgoldenrod,

    #background_color = :ivory
    )
