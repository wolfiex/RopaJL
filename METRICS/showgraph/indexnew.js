var width = 700//window.innerWidth;
var height = 700 // window.innerHeight;

window.svg = d3.select("svg").style("width", width).style("height", height);
var scale = 0.6;
window.dir = false;
window.links = true;
window.nodes = true;
window.labels = true;


what = 'londongraphs/forceatlas2'

    var fs = require("fs");
    var gexf = require("gexf");
    window.graph = gexf.parse(fs.readFileSync(what +".gexf", "utf8"));
window.data = {}

tsne=false

if (tsne){

  window.tsne= {}

  d3.csv("londongraphs/tsnet.out", function(error, data) {
  if (error) throw error;

  window.tsne= data
what = "londongraphs/tsnet"

  indexlocs = graph.nodes.map(d=>d.id)

  data.map(d=> {
      id = indexlocs.indexOf(d.spec)
      window.graph.nodes[id].viz.position.x= (d.x)*width
      window.graph.nodes[id].viz.position.y= (d.y)*height

});


})
}



//var map = new Map(data.nodes.map(d => [d.id, d]));
