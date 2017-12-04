"use strict";
window.count = 0
var dims = d3.min([window.innerWidth, window.innerHeight]);
// Network code from: Mike Bostock's example https://bl.ocks.org/mbostock/4062045

dims = 1080

var svg = d3
    .select("svg")
    .style("width", dims)
    .style("height", dims),
  width = dims,
  height = dims;

dims=dims

var cscale = d3.scaleLinear().domain([0,1])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#007AFF"), d3.rgb('#ee22b0')]);
 cscale =  function (x){return d3.interpolateGnBu(0.1+0.9*(1-x))}

var color = {
  "3": "#e4b0b0",
  "1": "#E8336D",
  "8": "#00897b"
};

var circlePadding = 10;

var simulation = d3
  .forceSimulation()
  .force(    "link",    d3.forceLink().id(function(d) {   return d.id;   }) )
  //.force("charge", d3.forceManyBody().strength(-6))
  .force("collide", d3.forceCollide()
  .radius(function(d) { return Math.pow(parseFloat(d.value),3)*10+.8 })
  .iterations(10))
  //.force("center", d3.forceCenter(width / 2, height / 2));

d3.json("tsne.json", function(error, graph) {
  if (error) throw error;
  console.log(graph);

  var newdims = 0.8*dims,
      shift =(1-newdims/dims)/2*dims

  graph.nodes = graph.nodes.map(d => {
    d.x = d.x * newdims +shift ;
    d.y = d.y * newdims + shift;
    //d.fx=d.x;    d.fy=d.y
    return d;
  });

  window.range = d3.extent(graph.links.map(d=>d.value))
  range[1]= range[1]-range[0]



  window.graph = graph




  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke-width", function(d) {
      return .4+5*.8*Math.sqrt((parseFloat(d.value)-range[0])/range[1])
    }).style('stroke',d=>cscale(Math.sqrt((parseFloat(d.value)-range[0])/range[1])))
    .style('opacity',.9)
    ;



  simulation.nodes(graph.nodes).on("tick", ticked);











  simulation.force("link").links(graph.links);

  function ticked() {





    window.count+=1
    if (window.count >1 ){simulation.stop();



        edgebundle(graph)






        window.node = svg
          .append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(graph.nodes)
          .enter().append("circle")
          .attr("r", d=>Math.pow(parseFloat(d.value),4)*5+.4)
          .attr("fill", function(d) {
            return color[d.group + ""] || "white";//"lightgrey";
          })
          .attr("stroke", function(d) {
            return color[d.group + ""] || "#222";//"lightgrey";
          })
          .attr("stroke-width", function(d) {
            return 0 || 1.3;//"lightgrey";
          })
          .attr("opacity", function(d) {
            return .9 || 0.6;//"lightgrey";
          }).attr('cx',d=>d.x).attr('cy',d=>d.y)
          .on('mouseover',d=>console.log(d));



/*
                                  svg.append("rect")
                                                           .attr("x", 0)
                                                           .attr("y", 0)
                                                             .attr("width", dims)
                                                            .attr("height", dims)
                                                            .style('fill','white')
                                                            .attr('opacity',0.13)

*/

        var posn = {NC9H20:[10,10,"NC9H20"], BENZENE:[100,100,"BENZENE"], CH4:[10,10,"CH4"],
        PENT1ENE:[200,-200,"PENT1ENE"], NC12H26:[10,10,"NC12H26"], CYHEXONE:[10,10,"CYHEXONE"],
         C5H11CHO:[10,10,"C5H11CHO"], NC5H12:[-30,-30,"NC5H12"],
         C3H7CHO:[10,10,"C3H7CHO"], NC4H10:[-200,10,"NC4H10"], CH3OH:[200,-200,"CH3OH"],
          NC10H22:[30,-50,"NC10H22"], CH3COCH3:[10,10,"CH3COCH3"], TOLUENE:[-100,100,"TOLUENE"],
           NC11H24:[10,-70,"NC11H24"], MEK:[200,-100,"MEK"], NC7H16:[30,-30,"NC7H16"],
           C4H9CHO:[10,10,"C4H9CHO"], NPROPOL:[10,10,"NPROPOL"], CH3CHO:[10,10,"CH3CHO"],
            C5H8:[10,10,"C5H8"], C3H6:[10,10,"C3H6"], C3H8:[10,10,"C3H8"], C2H6:[300,-300,"C2H6"],
             C2H4:[10,10,"C2H4"], C2H2:[200,200,"C2H2"], OXYL:[-200,50,"OXYL"], C2H5OH:[10,10,"C2H5OH"],
              MACR:[10,10,"MACR"]}

        var mynodes = graph.nodes.filter(d=>d.group===1)

        var annotations = mynodes.map(d=>{//console.log(d);
            return {

            note: {
              label: posn[d.id][2],
              title: ""
            },

            dy: posn[d.id][1],//d.x,
            dx: posn[d.id][0],//d.y,
            x: d.x, //1circle[0].x,
            y: d.y, //circle[0].y,
            type: d3.annotationCalloutCircle,
            subject: {
              radius: Math.pow(parseFloat(d.value),3)*10, //circle[0].r + circlePadding,
              radiusPadding: 0
            }
          }})


        window.makeAnnotations = d3
          .annotation()
          .annotations(annotations)
          .accessors({
            x: function x(d) {
              return d.x;
            },
            y: function y(d) {
              return d.y;
            }
          })
        svg
          .append("g")
          .attr("class", "annotation-encircle")
          .call(makeAnnotations)


      }
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

/*
    node
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });
*/
  }


  var groups = [3, 1, 8];
  var points = groups.map(function(p) {
    return graph.nodes
      .filter(function(d) {
        return d.group === p;
      })
      .map(function(d) {
        return { x: d.x, y: d.y, r: 5 };
      });
  });

  var circle = points.map(function(p) {
    return d3.packEnclose(p);
  });




  });
