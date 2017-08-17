function setupvor(
  min = [0.1 * width, 0.1 * height],
  max = [width * 0.9, height * 0.9]
) {
  group = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

  window.voronoi = d3
    .voronoi()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    })
    //.extent([[0.1*width, .1*height], [width *.9, height *.9]]);
    .extent([min, max]);

  var voronoi_path = group
    .selectAll("vornouli.cells")
    .data(nodes)
    .enter()
    .append("g")
    .classed("node", true)
    //.on('click', displayreactions)
    .on("mouseover", function(d) {
      console.log(d);
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  window.cell = voronoi_path
    .append("path")
    .data(voronoi.polygons(nodes))
    .attr("d", renderCell)
    .style("stroke", "red")
    .style("fill", "transparent")
    .attr("opacity", 0.2)
    .attr("id", function(d, i) {
      return "cell-" + i;
    });

  voronoi_path.append("circle").attr("clip-path", function(d, i) {
    return "url(#clip-" + i + ")";
  });
} //central voronoi.polygons(nodes).map(function(d){return [d3.polygonCentroid(d),d.data.names] })

function renderCell(d) {
  return d == null ? null : "M" + d.join("L") + "Z";
}

function labels() {
  voronoi.polygons(nodes).map(function(d) {
    context.fillStyle = "black";
    //return [d3.polygonCentroid(d),d.data.names]
    var pos = d3.polygonCentroid(d);
    context.fillText(d.data.names, pos[0], pos[1]);
    context.fillStyle = "#222";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "Bold 8px Open Sans";
  });
}

function zoomed() {}

function dragstarted(d) {
  d.fx = d.x;
  d.fy = d.y;
}
function dragged(d) {
  d.cx = d3.event.x;
  d.cy = d3.event.y;
  //window.cell = window.cell.data(voronoi.polygons(graph.nodes)).attr("d", renderCell);
}
function dragended(d) {
  d.fx = null;
  d.fy = null;
}

//stats window
(function() {
  var script = document.createElement("script");
  script.onload = function() {
    var stats = new Stats();
    document.body.appendChild(stats.dom);
    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };
  script.src = "./src/stats.js";
  document.head.appendChild(script);
})();

const cp = require("child_process");
