var width = window.innerWidth;
var height = window.innerHeight;

window.svg = d3.select("#svg").style("width", width).style("height", height);
var scale = 0.6;
window.dir = false;
window.links = true;
window.nodes = true;
window.labels = false;
/*
  var link = group
  .attr("class", "links")
  .selectAll("line")
  .data(data.links)
  .enter().append("line")
  .attr("stroke-width",(d)=>d.v)//(d) =>{(isFinite(edge_length[d.index]))? 10*window.edge_length[d] : 0.001} )
  //.attr("stroke-opacity",(d) =>{(isFinite(edge_length[d.index]))? 1: 0.001} )
  //.attr("opacity",(d) =>{(isFinite(edge_length[d.index]))? 1: 0.0 })
  .attr('fill','red');
*/
/*
  setupvor();
  /// d.index for edge length



    node
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });

   link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
    */

var map = new Map(data.nodes.map(d => [d.id, d]));
