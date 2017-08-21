var width = window.innerWidth;
var height = window.innerHeight;

window.svg = d3.select("svg").style("width", width).style("height", height);
var scale = 0.6;
window.dir = false;
window.links = true;
window.nodes = true;
window.labels = true;


what = 'londongraphs/yifanhu'

    var fs = require("fs");
    var gexf = require("gexf");
    window.graph = gexf.parse(fs.readFileSync(what +".gexf", "utf8"));
window.data = {}

tsne=true

if (tsne){

  alert('tsne override')
  window.tsne= {}

  d3.csv("londongraphs/tsnet.out", function(error, data) {
  if (error) throw error;

  window.tsne= data



  indexlocs = graph.nodes.map(d=>d.id)

  data.map(d=> {
      id = indexlocs.indexOf(d.spec)

      graph.nodes[id].viz.position.x= (d.x-0.5)*window.innerWidth*4
      graph.nodes[id].viz.position.y= (d.y-0.5)*window.innerHeight*4

});


})


}


window.posarr = graph.nodes.map(d=>d.viz.position.x).concat(graph.nodes.map(d=>d.viz.position.y))
window.posscale = d3.scaleLinear().domain(d3.extent(posarr))



//var map = new Map(data.nodes.map(d => [d.id, d]));
