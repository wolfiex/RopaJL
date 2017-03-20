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

    for t in [144,180,216]#[36,72,144,180,216,288]
      nx.newGraph()
      normalise(x) = x/norm(x)


      links = filter(i -> flux[i][t]>0 , 1:len(flux))
      tflux = [log10(flux[i][t]) for i in links]
      weight = 1+normalise(tflux)

      c= 0
      for i in links
          nx.addedge(edges[i][1],edges[i][2],weight[c+=1])
          println(c)
      end

      nx.p()


      a = nx.eigenvector("none")
      b = [try a[i] catch 0.0f0 end for i in nodes]

      a1 = nx.eigenvector()
      b1 = [try a1[i] catch 0.0f0 end for i in nodes]

      difference = [abs(i) for i in (b-b1)]
      difference= [difference[i]/(b[i]+1e-9) for i in 1:len(b)]

    if test
      plot!(
          difference,

          label  = "$t",
          ylabel = "Eigenvector Centrality",
          xlabel = "Species Index",

          title  = "Unicode plots: Eigen-centrality Comparison",
          xrotation = rad2deg(pi/3),
          )


    else
        plot(
            difference,

            label  = "$t",
            ylabel = "Eigenvector Centrality",
            xlabel = "Species Index",

            title  = "Unicode plots: Eigen-centrality Comparison",
            xrotation = rad2deg(pi/3),
            )

    end


      test=true

    end
