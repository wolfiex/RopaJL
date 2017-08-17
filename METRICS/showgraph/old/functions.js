
function heatmap(){
saveloc(window.graph);
window.simulation.stop();
var cmd = 'python src/heatmap.py '+window.width+' '+window.height+ ' 30'
var child = require('child_process').exec(cmd,
   function (error, stdout, stderr) {
		 console.log(stdout);
	   child.stdout.pipe(process.stdout);
		 var ifr = document.getElementById('heatmapiframe')
		 ifr.width=window.width;
		 ifr.height=window.height;
		 ifr.src='./heatmap.html';
	 	 });
     document.getElementById('heatmapiframe').src='./heatmap.html';
}



function groupselect(){

simulation.stop();


var mySVG = d3.select("#selector").append("svg").attr('width',width).attr('height',height).on('dblclick', polyClick), point =[];


function polyClick() {
  point.push(d3.mouse(this));
  if (point.length>2) drawPoly(point);

  function drawPoly(point) {
    d3.select(".p").remove();
    mySVG.append("svg:polygon")
      //.style("fill", "red")
      .attr("points", [].concat.apply([], point) );

    simulation.nodes().filter(function(d) {
      var w = d.x + window.width/2 , h = d.y + window.height/2;
      inside = d3.polygonContains( point, [w,h] );

      if (inside){ console.log(d.name);
        mySVG.append("text").text(d.name).attr('x',w).attr('y',h).style('fill', 'white');
        };
      })

  }}


}

function drawNodes(d,i){
  context.beginPath();
  context.fillStyle = "rgba(100,100,100,0.1)";
  //context.moveTo(d.x, d.y);
  context.arc(d.x, d.y, 10*plus_ns*node_sizes[i], 0, 2 * Math.PI);
  context.lineWidth = (2 + plus_ns*1.8+node_sizes[i])/6;
  context.strokeStyle = (window.primary.indexOf(d.name) == -1)? 'rgba(0,105,0,0.8)':"#2979ff";
  context.stroke();
  context.fill();
  context.closePath();
};


function drawLink(d) {
        context.beginPath();
        context.moveTo(d.source.x, d.source.y);
        //quardratic cubic
        //context.quadraticCurveTo(1.2*(d.source.x+d.target.x)/2 , 1.2*(d.source.y+d.target.y)/2 ,d.target.x, d.target.y);


        // broken to correct context.quadraticCurveTo(1.2*Math.abs(d.source.x-d.target.x)/2 , 1.2*Math.abs(d.source.y-d.target.y)/2 ,d.target.x, d.target.y);
        //console.log(  '---'     ,Math.sqrt(Math.pow(Math.abs(d.source.x-d.target.x),2)+ Math.pow(Math.abs(d.source.y-d.target.y),2))/2.0 );

        //var radius = Math.sqrt(Math.pow(Math.abs(d.source.x-d.target.x),2)+ Math.pow(Math.abs(d.source.y-d.target.y),2))/2.0 ;

        //context.arc(width+(d.target.x+d.source.x)/2, height+(d.target.y+d.source.y)/2,radius,0,Math.pi)

        //linear
        context.lineTo(d.target.x, d.target.y);


        context.strokeStyle =(window.color(d.value));
        context.lineWidth= 0.1 + 8*(0.2+(1-d.value)/3);
        if (d.dir != 0){
        context.setLineDash([5, 2]);
        }
        context.filter=''
        //console.log(d)

        context.stroke(); // draw stroke
        context.closePath();
        }



function central(voronoi,group){
  voronoi.polygons(graph.nodes).filter(function(d){v.push( d3.polygonCentroid(d))},v=[]);

  group.selectAll("scatter-dots")
        .data(v)
        .enter().append("svg:circle")
            .attr("cx", function (d,i) { return d[0]; } )
            .attr("cy", function (d) { return d[1]; } )
            .attr('fill','blue')
            .attr("r", 8);

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



/*
font-family: 'Open Sans', sans-serif;

font-family: 'Lato', sans-serif;

font-family: 'Fredericka the Great', cursive;
*/

function textstyle(d,i){
   voronoi.polygons(graph.nodes).filter(function(d){v.push( d3.polygonCentroid(d))},v=[]);
    var txt_width = 20;//node_sizes[i];
	  var fontsize = fitTextOnCanvas(d.name, "Fredericka the Great",2*txt_width);
    if (window.v==='undefined') {pos=[d.x,d.y]}else{ pos = window.v[i]};
    context.fillText(d.name,pos[0],pos[1]);


    context.textAlign = 'center';
    context.textBaseline = 'middle';
    }





// controls
function for_print(adjustable){

    d3.select('body').style('background-color', 'white'); // bg colour
    d3.selectAll('circle').style('fill-opacity','0.79')


    window.textstyle = function (d,i){
        var txt_width = 100*node_sizes[i];


        context.font = "18px Ubuntu";
        var fontsize = fitTextOnCanvas(d.name, "Fredericka the Great",(80 + 30*node_sizes[i]));
        //if (adjustable==='undefined') {var fontsize = fitTextOnCanvas(d.name, "Ubuntu",2*txt_width)};
        if (window.v==='undefined') {pos=[d.x,d.y]}else{ pos = window.v[i]};
        context.fillText(d.name,pos[0],pos[1]);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        }

    window.textcolour = 'black';

}

// save canvas element to file
function canvas2file(canvas){



  var fs = require('fs');
  var nativeImage = require('electron').nativeImage;
  //var types = ['image/png', 'image/jpg', 'image/jpeg'];
  type = 'image/png';
  quality = 1;

  simulation.stop();
 simulation.alpha(0);
  //add svg to canvas
  for_print();
  d3.selectAll('svg').remove();

  if (simulation.alpha() ==0 ) {
     console.log('fsdf');
    context.clearRect(0, 0, width, height);
    context.save();
    //context.translate(width / 2, height / 2);
    graph.links.forEach(drawLink);
    context.setLineDash([1,0]);
    graph.nodes.forEach(drawNodes);

    base_image = new Image();
    base_image.src = window.linkleneq+'.png';
    base_image.onload = function(){
    context.drawImage(base_image, 0, height-140);

context.fillStyle = window.textcolour;
graph.nodes.forEach(textstyle);

context.fillStyle = 'red';
context.font = "14px Source Sans Pro";
context.fillText(window.linkleneq,width/2,50);

context.restore();
var data = canvas.toDataURL(type, quality);
var img = typeof nativeImage.createFromDataURL === 'function'
  ? nativeImage.createFromDataURL(data) // electron v0.36+
  : nativeImage.createFromDataUrl(data) // electron v0.30
//select type
 var imdata = (/^image\/jpe?g$/.test(type))?
    img.toJpeg(Math.floor(quality * 100)) : img.toPng();

fs.writeFile('./save/'+window.linkleneq+'.png', imdata, function (err) {throw err})

  }


  }



    //var image = window.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
    //window.location.href=image;
    d3.selectAll('svg').remove();

};
      ///save node locations

function saveloc(graph){
        var fs = require('fs');

          graph.dims= [window.width, window.height];
        var filepath = "locations.json";// you need to save the filepath when you open the file to update without use the filechooser dialog againg
        var content = JSON.stringify(graph);

        fs.writeFile(filepath, content, function (err) {
              if(err){
                    alert("An error ocurred updating the file"+ err.message);
                    console.log(err);
                    return;
              }
              console.log("The file has been succesfully saved");
         });
      }


function theres_no_limit() {
        setTimeout(function () {
      if (window.dummy.findmax){
          window.graph.nodes.forEach(function(d){x.push(d.x); y.push(d.y)},x=[],y=[]);
          limits = {minx:d3.min(x),miny:d3.min(y),maxx:d3.max(x),maxy:d3.max(y)};
          simulation.force("link").distance(function(d){var dv= d.value;return window.dummy.min  * eval(linkleneq)});
          if ( limits.maxx > 0.9*width/1.1 || limits.maxy > 0.9*height/1.1|| limits.minx < 0.1*width/1.1 || limits.miny < 0.1*width/1.1){
            window.dummy.max=window.dummy.min;
            window.dummy.min/=2;
          }else{ window.dummy.findmax=false; window.dummy.count=0; }
          if (window.dummy.min<0.25){alert('Cant shrink any more, expand window size')
        }else{theres_no_limit()};
      }else{
            window.dummy.count+=1;
            var midrange = (window.dummy.max + window.dummy.min )/2.;
            window.graph.nodes.forEach(function(d){x.push(d.x); y.push(d.y)},x=[],y=[]);
            limits = {minx:d3.min(x),miny:d3.min(y),maxx:d3.max(x),maxy:d3.max(y)};
            simulation.force("link").distance(function(d){var dv= d.value;return midrange * eval(linkleneq)});
            if ( limits.maxx > 0.99*width/1.1 || limits.maxy > 0.99*height/1.1|| limits.minx < 0.01*width/1.1 || limits.miny < 0.01*width/1.1){
              window.dummy.max=midrange ;
            }else{window.dummy.min=midrange}
        if (window.dummy.count<11){
          simulation.alpha(0.1);
          theres_no_limit();
        }else{console.log('within size');
          simulation.force("link").distance(function(d){var dv= d.value;return window.dummy.min * eval(linkleneq)});
          simulation.alpha(1);window.dummy.done=true};
        }
      },1000);
      }


///show new window.


function zoomed() {
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(d3.event.transform.x, d3.event.transform.y);
      context.scale(-d3.event.transform.k, -d3.event.transform.k);
      drawPoints();
      context.restore();
    }

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y
  //window.cell = window.cell.data(voronoi.polygons(graph.nodes)).attr("d", renderCell);
}



function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function renderCell(d) {
  return d == null ? null : "M" + d.join("L") + "Z";
}
