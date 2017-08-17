// https://en.wikipedia.org/wiki/Centrality

var search = 128;
var linkmatch = data.links.filter(d => {
  if (d.source === search || d.target === search) return d;
});

var degree_centrality = linkmatch.length;

var lengthvalues = linkmatch.map(d => d.v);

//lenght between a node and all other nodes // often multiplied by number of nodes -1
var connected_closeness_centrality = 1 / d3.sum(lengthvalues);

var average_reactivity = d3.mean(lengthvalues);

var percent_shortest = d3.mean(lengthvalues.map(d => d < 0.3 ? 1 : 0));

var degree_shortest = d3.sum(lengthvalues.map(d => d < 0.3 ? 1 : 0));

//betweenness centrality
//

function run(what) {
  var clr = d3.scaleLinear().range(["#116cff", "#ff1111"]);
  var clr = ColourScheme(viridis);
  var val = data.nodes.map(e => {
    var search = e.id;
    var linkmatch = data.links.filter(d => {
      if (d.source === search || d.target === search) return d;
    });

    var lengthvalues = linkmatch.map(d => d.v);

    return eval(what);
  });
  var max = d3.max(val);
  data.nodes.forEach((e, i) => {
    document.getElementById("node" + e.id).style.stroke = clr(val[i] / max);
    document.getElementById("node" + e.id).style["fill-opacity"] = 1;
    document.getElementById("node" + e.id).style["stroke-opacity"] = 1;
    d3.select("#node" + e.id).attr("r", 1 + val[i] / max * 7 * scale);
  });
}
