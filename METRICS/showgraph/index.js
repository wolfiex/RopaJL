var width = window.innerWidth;
var height = window.innerHeight;




window.svg = d3.select("svg").style("width", width).style("height", height);
var scale = 0.6;
window.dir = false;
window.links = true;
window.nodes = true;
window.labels = true;


what = 'londongraphs/forceatlas2'

    var fs = require("fs");
    var gexf = require("gexf");
    var graph = gexf.parse(fs.readFileSync(what +".gexf", "utf8"));
window.data = {}
data.nodes = graph.nodes
data.links = graph.edges


posarr = data.nodes.map(d=>d.viz.position.x).concat(data.nodes.map(d=>d.viz.position.y))


posscale = d3.scaleLinear().domain(d3.extent(posarr))


data.nodes = data.nodes.map(d=>{d.viz.position.x = posscale(d.viz.position.x); d.viz.position.y = posscale(d.viz.position.y ); return d })


//var map = new Map(data.nodes.map(d => [d.id, d]));
