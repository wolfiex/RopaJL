
function fixmutual(nodes){
  //fix mutual
  sum = d3.sum(nodes.map(d=>both.has(d.id)))
  dummy = 0
  nodes= nodes.map(function(d){  if( both.has(d.id)){dummy += 1 ; d.fx = 0.1*width + .8*width*(dummy/sum); d.fy = height/2}; return d  });
return nodes}


function fixdifferent(nodes){
  //fix mutual
  nwsum = d3.sum( nodes.map(d=>!both.has(d.id) * data.new.species.has(d.id)))
  odsum = d3.sum( nodes.map(d=>!both.has(d.id) * data.old.species.has(d.id)))
  //console.log(nwsum,odsum)
  var nw =0 , od = 0;
  nodes= nodes.map(function(d){  if( !both.has(d.id)){
    if (data.new.species.has(d.id)) {nw+=1; d.fx =  .1*width + .8*width*(nw/nwsum); d.fy = height*0.1}
    if (data.old.species.has(d.id)) {od+=1; d.fx =  .1*width + .8*width*(od/odsum); d.fy = height*0.9}
}return d});

window.simulation.force("charge", d3.forceManyBody().strength(function(d){return both.has(d.id)? -900:0}))
return nodes}

function sortmutual(nodes){
  //fix mutual
  sum = d3.sum(nodes.map(d=>both.has(d.id)))
  dummy = 0
  nodes= nodes.map(function(d){  if( both.has(d.id)){dummy += 1 ; d.fx = 0.1*width + .8*width*d.tally; d.fy = height/2}; return d  });
return nodes}



function pie(nodes){
 nodes = nodes.map( function(d){

    d.tally = (d.new.length + 1e-9)/(1e-9+d.old.length);

    //console.log(parseInt(100*d.tally), "l"+d.id)

    var areaGradient = d3.select('#svg0').append("defs")
    .append("linearGradient")
    .attr('id',"l"+d.id)
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "0%").attr("y2", "100%");

    areaGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#E30B5D")
    .attr("stop-opacity", 1);
    areaGradient.append("stop")
      .attr("offset", parseInt(100*d.tally)+"%")
    .attr("stop-color", "#3864EB")
    .attr("stop-opacity", 1);



       return d

 })
return nodes



}



function setupvor(){

  group = d3.select('#svg0').attr('width',width).attr('height',height).append("g")


    window.voronoi = d3.voronoi()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .extent([[0.1*width, .1*height], [width *.9, height *.9]]);

      var voronoi_path = group.selectAll("vornouli.cells")
        .data(nodes)
        .enter().append("g")
        .classed("node", true)
        .on('click', displayreactions)
        .on('mouseover',function(d){d=> document.getElementById('mouseover').innerHTML=d.name})
          .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

      window.cell = voronoi_path.append("path")
        .data(voronoi.polygons(nodes))
          .attr("d", renderCell)
          //.style('stroke','red')
          .style('fill','transparent')
          .attr('opacity',0.2)
          .attr("id", function(d, i) { return "cell-" + i; });

      voronoi_path.append("circle")
              .attr("clip-path", function(d, i) { return "url(#clip-" + i + ")"; });


}

function central(){
  voronoi.polygons(nodes).filter(function(d){v.push( [d3.polygonCentroid(d),d.data.name])},v=[]);
  return v
}

function renderCell(d) {
  return d == null ? null : "M" + d.join("L") + "Z";
}












function fitTextOnCanvas(text, fontface,t_width){ return measureTextBinaryMethod(text, fontface, 0, 600, t_width); }

function measureTextBinaryMethod(text, fontface, min, max, desiredWidth) {
	if (max-min < 1) { return min; }

	var test = min+((max-min)/2); //Find half interval
	context.font=test+"px "+fontface;
	measureTest = context.measureText(text).width;
	if ( measureTest > desiredWidth) {
		var found = measureTextBinaryMethod(text, fontface, min, test, desiredWidth)
	} else {
		var found = measureTextBinaryMethod(text, fontface, test, max, desiredWidth)
	}
	return found;
}



function getreact (mech,d){
dummy = [];
for (i = 0; i < mech.rct.length; i++) {
  if ((mech.rct[i].indexOf(d)>-1)|(mech.prd[i].indexOf(d)>-1)) dummy.push(mech[i]);
}
return dummy
}





function zoomed() {
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(d3.event.transform.x, d3.event.transform.y);
      context.scale(-d3.event.transform.k, -d3.event.transform.k);
      drawPoints();
      context.restore();
    };

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.000003).restart();
  d.fx = d.x;
  d.fy = d.y;
};
function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y
  //window.cell = window.cell.data(voronoi.polygons(graph.nodes)).attr("d", renderCell);
};
function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  //if (simulation.isFixed(d3.event.subject)) simulation.unfix(d3.event.subject);
  d.fx = null;
  d.fy = null;
};

//stats window
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='./src/stats.js';document.head.appendChild(script);})()
const cp = require('child_process');



// class to read netcdf
class nc2D {
  constructor(name, width, arr_type) { //Float32Array
    this.width = dims[width];
    this.arr_type = arr_type
    this.data = new arr_type(reader.getDataVariable(name));
  }
};
nc2D.prototype.row = function (index) {
   start = index*this.width;
   return new this.arr_type(this.data.slice(start,start+this.width))
}

//print array
var print = (d) => console.log(d);


function displayreactions(d) {
document.getElementById('sidebar').style.display='block'
document.getElementById('species').innerHTML = d.name;
dummy = ''
d.new.forEach(d=>dummy+=d +'<br>')
document.getElementById('oldrxn').innerHTML = dummy;
dummy = ''
d.old.forEach(d=>dummy+=d +'<br>')
document.getElementById('newrxn').innerHTML = dummy;


}




function names(){
simulation.stop()
svg = d3.select('#svg0')
svg.selectAll('text').remove()
dummy=d3.max(nodes.map(d=>d.s))

nodes.map(function(d){

if (d.fx==null){
  svg.append("text")
  .attr('fill','white')
  .attr('text-align', 'center')
  .attr('text-anchor', 'middle')
  .attr("font-family", "sans-serif")
  .attr("font-size", "12px")
  .attr('text-shadow', '0 1px 0 #fff')
  //.classed("popUpTextLeft", true) //-CSS class for the text
  .attr("x", d.x)
  .attr("y", d.y+24+10*(d.s/dummy)) //-new line when going through the loop
  .text(d.name); //-goes through each element in the text array

}
})
}


function textMultipleRows(textArray, area, xPos, yPos){
    d3.select(area).selectAll('text').remove()

    for(i=0;i<textArray.length;i++){
        svg = d3.select(area) //-area you wish to append the text to
        svg.append("text")
        .attr('fill',textArray[i].col)
        .classed("popUpTextLeft", true) //-CSS class for the text
        .attr("x", xPos)
        .attr("y", yPos+(i*20)) //-new line when going through the loop
        .text(textArray[i].text); //-goes through each element in the text array
    }
}


function closesidebar(){if (document.getElementById('sidebar').style.display === 'block') document.getElementById('sidebar').style.display='none'}



function stringifytofile (file,object){
  var fs = require('fs');
  fs.writeFile("./"+file+'.json',JSON.stringify(object), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });

}
