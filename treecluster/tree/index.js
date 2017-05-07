"use strict";

///////////
/////program code
////////////







///draw function

function draw() {
  var svg = d3.select("svg");
  svg.selectAll("*").remove();
  svg.style("width", width);
  svg.style("height", height);
  svg.style(
    "transform",
    "translate(" + window.innerWidth / 2 + "," + window.innerHeight / 2 + ")"
  );

  d3
    .select("svg")
    .append("path") //.attr("d", '')
    .attr("id", "arc")
    .attr("fill", "transparent") //.attr('fill-opacity',0.1)
    .attr("stroke-width", 2.3)
    .attr("stroke", "black")
    .attr("opacity", 1)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //for in labels , draw arc, rotate
  var can = document.getElementById("canvas");
  can.width = width;
  can.height = height;
  var ctx = can.getContext("2d");
  ctx.clearRect(0, 0, width, height); //legend(colour, svg); //add a legend

  var row = ncdata.concentration.row(dims["time"] - 1); //select last row for ordering
  var max_radius = (Math.min(width, height) / 2 - 20) * 0.70;
  var px = 8;

  var arc1 = d3.arc().innerRadius(0).outerRadius(max_radius * 1.1); /// load arc

  var foreground = svg
    .append("path")
    .datum({
      endAngle: (-2.0) * Math.PI,
      startAngle: 0.0
    })
    .style("fill", "white")
    .attr("d", arc1)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  foreground
    .transition()
    .duration(5050)
    .ease(d3.easeCubic)
    .call(arcTween, 0, 0);

  function arcTween(transition, newStartAngle, newFinishAngle) {
    transition.attrTween("d", function(d) {
      var interpolateStart = d3.interpolate(d.startAngle, newStartAngle);
      var interpolateEnd = d3.interpolate(d.endAngle, newFinishAngle);
      return function(t) {
        d.startAngle = interpolateStart(t);
        d.endAngle = interpolateEnd(t);
        return arc1(d);
      };
    });
  }

  var names = [];

  if (orderBylast) {
    var indices = new Array(row.length);
    for (var i = 0; i < row.length; ++i) {
      indices[i] = i;
    }
    indices.sort(function(a, b) {
      return row[a] < row[b] ? -1 : row[a] > row[b] ? 1 : 0;
    });

    indices.forEach(d => names.push(ncdata.rdict[d]));
  }

  // generate name labels

  var counter = 0;
  var labels = [];
  for (var j = 0; j < names.length; j++) {
    var d = names[j];
    //filter by C,N or All
    if (window.filterby.indexOf(d) > -1) {
      var i = ncdata.dict[d];
      if (
        row[i] +
          (+ncdata.concentration.row(parseInt(dims["time"] / 2))[i]) +
          ncdata.concentration.row(1)[i] >
        0
      ) {
        labels.push({
          name: d,
          id: i,
          path: [],
          col: j /// window.filterby.length
        });
      }
    }
  }
  //

  var theta = 2.0 * Math.PI / parseFloat(labels.length);

  labels = labels.map(function(d, i) {
    d.angle = i * theta;
    d.col /= labels.length;
    d.x = 1.1 * max_radius * Math.cos((i + 0.5) * theta);
    d.y = 1.1 * max_radius * Math.sin((i + 0.5) * theta);
    return d;
  });
  /*





*/
  // drawing
  svg
    .selectAll(".node")
    .data(labels)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + (d.x + width / 2) + " " + (d.y + height / 2) + ")";
    })
    //

    .append("text")
    .attr("transform", function(d) {
      return d.angle > Math.PI / 2 & d.angle < Math.PI / 2 * 3
        ? "rotate(" +
            (360 - 180 + 180 * d.angle / Math.PI) +
            " 0 -" +
            px / 2 +
            ")"
        : "rotate(" + 180 * d.angle / Math.PI + " 0 -" + px / 2 + ")";
    })
    .style("text-anchor", function(d) {
      return d.angle > Math.PI / 2 & d.angle < Math.PI / 2 * 3
        ? "end"
        : "start";
    })
    .style("font-size", px + "px")
    .style("fill", function(d, i) {
      return colour(i / filterby.length);
    })
    .text(function(d) {
      return d.name;
    })
    .on("mouseover", function(d) {
      d3.select(this).style("font-size", 10 + px + "px");
      d3.select(canvas).style("opacity", 0.2);
      //console.log(d);
      var angle = (-Math.PI) / 2;
      var path = "";
      path += " M " +
        max_radius * d.path[0] * Math.cos(angle) +
        " " +
        max_radius * d.path[0] * Math.sin(angle);
      for (var j = 0; j < d.path.length; j++) {
        angle += degree;
        path += " L " +
          max_radius * d.path[j] * Math.cos(angle) +
          " " +
          max_radius * d.path[j] * Math.sin(angle);
      }
      path += " L " +
        max_radius * d.path[0] * Math.cos((-Math.PI) / 2) +
        " " +
        max_radius * d.path[0] * Math.sin((-Math.PI) / 2);

      d3
        .select("path#arc")
        .style("opacity", 1)
        .attr("d", path + " Z")
        .style("stroke", window.colour(d.col));
      console.log(d);
    })
    .on("mouseout", function(d) {
      d3.select(this).style("font-size", px + "px");
      d3.select(canvas).style("opacity", 1);
      d3.select("path#arc").style("opacity", 0);
    });

  /*





 */
  // times ten - to make a lotus.

  for (var j = sti + 1; j < eni; j = j + by) {
    var dummy = ncdata.concentration
      .row(j)
      .map(d => d > 0 ? Math.log10(d) : -99);

    dummy = dummy.map(d => d === -99 ? d3.min(dummy) - 1 : d);
    ///

    var scale = d3
      .scaleLinear()
      .domain([d3.min(dummy), d3.max(dummy)])
      .range([0, 1]);

    var path = [];

    labels = labels.map(function(d) {
      d.path.push(scale(dummy[d.id]));
      return d;
    });
  }

  /*





  */

  var degree = 2.0 * Math.PI / ((eni - sti) / by);

  labels.forEach(function(d, i) {
    var angle = 0;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    ctx.beginPath();
    ctx.rotate(-(Math.PI / 2));


    ctx.moveTo(
      max_radius *  Math.cos(angle),
      max_radius *  Math.sin(angle)
    );
    for (var j = 0; j < d.path.length; j++) {
      angle += degree;

      // line 1
      ctx.lineTo(
        max_radius * d.path[j] * Math.cos(angle),
        max_radius * d.path[j] * Math.sin(angle)
      );
      //console.log(max_radius*path[j]*Math.cos(angle),max_radius*path[j]*Math.sin(angle))
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = window.colour(i / filterby.length);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
  });
  /*
  var select = d3.select('#footer')
    .append('select')
    	.attr('class','select')
      .on('change',function(){selectspec({'name':d3.select('select').property('value')})}) //function todo


  var options = select
    .selectAll('option')
  	.data(labels).enter()
  	.append('option')
  		.text(function (d) { return d.name; });

*/
}
