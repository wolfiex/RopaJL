
//use js to laod required libraries here
function edgebundle(data) {
  var names = data.nodes.map(d => d.id);
  var node_data = data.nodes.map(function(d) {
    return {x:d.x, y:d.y, value:d.value };
  });

  data.links.forEach(
    function(d) {
      if (d.source.id != '')
      link_data.push({
        source: names.indexOf(d.source.id),
        target: names.indexOf(d.target.id),
        lcol: d.v
      });
    },
    link_data = []
  );

  //console.log(link_data,'fdf',node_data, names)

  var fbundling = ForceEdgeBundling()
  .step_size(0.1)
  .compatibility_threshold(.3)//0.3)
  .nodes(node_data)
  .edges(link_data);
  var results = fbundling();

  var d3line = d3
  .line()
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  })
  .curve(d3.curveLinear);
  //plot the data
  for (var i = 0; i < results.length; i++) {
    var svg = d3.select("svg");
    svg.style("width", width);
    svg.style("height", height);
    svg.style(
      "transform",
      "translate(" + window.innerWidth / 2 + "," + window.innerHeight / 2 + ")"
    );

    console.log(results)
    svg
    .append("g")
    .append("path")
    .attr("d", d3line(results[i]))
    .attr("id", "link" + i)
    .style("fill", "none")
    .attr("stroke-width", function(d) {
      return .4+5*.8*Math.sqrt((parseFloat(ink_data[i].value)-range[0])/range[1])
    }).style('stroke',d=>cscale(Math.sqrt((parseFloat(ink_data[i].value)-range[0])/range[1])))
    .style('opacity',.9)
  }
}
