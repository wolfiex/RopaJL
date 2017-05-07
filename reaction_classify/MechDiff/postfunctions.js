//use js to laod required libraries here

  function edgebundle(){

    print('open new -analysis- window, apply tranformations there')
    //simulation.stop();

    //d3.selectAll('svg').select('g').selectAll('links').remove()
    d3.selectAll('svg').selectAll('line').remove()

    var canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#000'


    sp = [];
    species.forEach(d=> sp.push(d))

stringifytofile('nodes',nodes)
stringifytofile('graphlinks',graphlinks)

function newset(group,thresh){
    var node_data ={}

    window.nodes.forEach(function(d){node_data[sp.indexOf(d.id)]={'x':d.x ,'y':d.y , 'col':1};console.log(node_data[d.names])});
    graphlinks.forEach(function(d){if (d.new===group) {link_data.push({'source':sp.indexOf(d.source.id) ,'target':sp.indexOf(d.target.id) , 'new':d.new})}},link_data =[]);
/*
    node_data={};
           for (var i = 0; i < nodes.length; i++) {
             d = nodes[i]
             node_data[d.id]={'x':d.x ,'y':d.y , 'col':1}
           }
*/

//console.log(link_data,node_data)

    var fbundling = ForceEdgeBundling()
    .step_size(0.1)
    .compatibility_threshold(!group? .2:.5)
    .nodes(node_data).edges(link_data);
    var results = fbundling();

stringifytofile('results'+group+'.json',results)

    var d3line = d3.line()
           .x(function (d) {
               return d.x;
           })
           .y(function (d) {
               return d.y;
           })
           .curve(d3.curveLinear);
       //plot the data
       for (var i = 0; i < results.length; i++) {


         var svg1 = d3.select("#svg1");
         svg1.style('width', width);
         svg1.style('height', height);
         svg1.style("transform", "translate("+window.innerWidth/2.+","+window.innerHeight/2.+")")

           svg1.append("path")
               .attr("d", d3line(results[i]))
               .attr('id', 'link'+i)
               .style("fill", "none")
               .attr("stroke-width",(d)=>1.3)//(d) =>{(isFinite(edge_length[d.index]))? 10*window.edge_length[d] : 0.001} )
               //.attr("stroke-opacity",(d) =>{(isFinite(edge_length[d.index]))? 1: 0.001} )
               .attr("opacity",0.6)
               //attr("stroke-dashoffset", function(d) { return (d.new) ? "0%":6  }) //for dashed line
               //.attr("stroke-dasharray", function(d) { return (d.new) ? "6,6" : '1,0'} )
               .style('stroke', !group? window.blue:window.pink);

          var p = new Path2D(d3line(results[i]));
          //ctx.stroke(p)




       //ctx.fill(p);

}
       }



newset(false)
newset(true)

}
