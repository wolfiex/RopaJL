////////////////////////////////////////////////////////////////////////////////
// make bars
////////////////////////////////////////////////////////////////////////////////

function draw(spec, timestep) {

  var x = d3
    .scaleLinear()
    .domain([0, ncdata.dims.time])
    .range([0, window.innerWidth * 0.49]);

  var y = d3.scaleLinear().domain([0, 1]).range([20, 0]);

  var valueline = d3
    .line()
    .x(function(d, i) {
      return x(i);
    })
    .y(function(d) {
      return y(d);
    });

  miniplot(spec,valueline)

  document.getElementById("dropdown").value = spec;
  document.getElementById("valueslider").value = timestep;
  document.getElementById("output").value = d3.timeFormat('%b %d %Y - %H:%m')(ncdata.datetime[timestep]);
  svg.selectAll("*").remove();

  data = [];
  var prod = [], loss = [];
  var specindex = ncdata.dict[spec];

  for (var i = 0; i < ncdata.combine.length; i++) {
    if (specindex === ncdata.tar[i]) {
      ncdata.combine[i][0].forEach(d => prod.push(d));
      ncdata.combine[i][1].forEach(d => loss.push(d));
    }
    if (specindex === ncdata.src[i]) {
      ncdata.combine[i][1].forEach(d => prod.push(d));
      ncdata.combine[i][0].forEach(d => loss.push(d));
    }
  }

  loss = new Set(loss);
  prod = new Set(prod);

  var selectedflux = ncdata.flux.row(timestep);

  loss = topfew(loss, false, selectedflux);
  prod = topfew(prod, true, selectedflux);

  tloss = loss[1];
  tprod = prod[1];
  loss = loss[0];
  prod = prod[0];

  var ttotal = tprod + tloss;

if (ttotal <= 0){
d3
.selectAll("g")
.append("text")
.text(d => 'No Flux -/- DEPLETED')
.attr("x", width / 2 )
.attr("y", height/2)
.style("font-size", "30px")
.style("text-anchor", "middle")
return}

  tprod /= ttotal;
  tloss /= ttotal;

  var tmax = d3.max([tprod, tloss]);


  plot(prod, true, ttotal, tmax, tprod);
  plot(loss, false, ttotal, tmax, tloss);
  overall(tloss);
  //
}

/*










*/

function plot(data, production, ttotal, tmax, datamax) {


var hshift = 20 ; 

  while (data.length< topn+1){
    data.unshift({
      reaction: ' '.repeat(data.length),
      value: 0,
      prod: production

    });

}

  data = data.map(d => {
    d.flux=d.value;
    d.value /= ttotal;
    return d;
  });


  var x = d3.scaleLinear().range([0, width / 2]);
  var y = d3.scaleBand().range([height, 0]);
  x.domain([0, tmax]);
  y
    .domain(
      data.map(function(d) {
        return d.reaction;
      })
    )
    .padding(0.1);

  var g = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + (production ? width / 2 : 0) + "," + 0 + ")"
    )
    //.attr("id", production);
  //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + 3 + ")") //(30 + height)
    .attr('opacity','0.4')
    .call(
      d3.axisTop(
        d3.scaleLinear().range(production ? [0, width / 2] : [width / 2, 0])
      ).tickSize([3]).tickFormat(d=>parseInt(100*d)+'%')
    ); //percent axis rather than actual



g
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + 3 + ")") //(30 + height)
    .attr('opacity','0.4')
    .call(
      d3.axisBottom(
        d3.scaleLinear().range(production ? [0, width / 2] : [width / 2, 0])
      ).tickSize([0]).ticks([1]).tickFormat((d,i)=>i==1?(production? '% Production': '% Loss') :parseInt(100*d)+'%')
    ); //percent axis rather than actual






  g //yaxis
    .append("g")
    .attr("class", "y axis")
    .attr(
      "transform",
      "translate(" + (production ? 0 : width / 2) + "," + hshift + ")"
    )
    .call(
      production
        ? d3.axisRight(y).tickFormat("")
        : d3.axisLeft(y).tickFormat("")
    ) ;

  var bar = g
    .selectAll(".bar")
    .exit()
    .remove()
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", d => x(d.value))
    .attr("x", d => production ? 0: -x(d.value))
    .attr("y", d => y(d.reaction))
    .style("fill", function(d) {
      return d.prod ? "#0277bd" : "#fc1333";
    })
    .style("mask", d => /Other/.test(d.reaction) ? "url(#mask)" : "")
    .attr(
      "transform",
      "translate(" + (production ? 0 : width / 2) + "," + hshift + ")"
    )
    .attr("height", y.bandwidth())//40 
    .on("mousemove", function(d) {
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html(
          d.reaction +
            "<br>" +
            format(d.value / ttotal) +
            "% of total <br>" +
            format(d.value / datamax) +
            "% of" +
            (production ? "Production" : "Loss")
        );
    })
    .on("mouseout", function(d) {
      tooltip.style("display", "none");
    });

  var boxheight = 40//y(data[data.length - 1].reaction);

  g
    .selectAll(".rxn")
    .data(data)
    .enter()
    .append("text")
    .text(d => d.reaction)
    .attr("x", d => production ? 10 + x(d.value) : width / 2 - x(d.value) - 10)
    .attr("y", d => y(d.reaction) + boxheight/2)
    .style("fill", "black")
    .style("font-size", "10px")
    .attr("text-anchor", production ? "start" : "end")
  .attr("alignment-baseline", "hanging");

  //

    var text = g
        .selectAll(".textval")
        .attr("id", "texts")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "textval")
        .text(function(d) { return (d.value > .08) ? format(d.flux) : "";
        }) // only display if greater than 0.1%
        .attr("x", d => production ? 0+x(d.value)-30:  width/2-x(d.value)+30 )
        .attr("y", d => y(d.reaction)+hshift)
        .style("font-size", "10px")
        .attr("text-anchor", production ? "start" : "end")
        .attr("alignment-baseline", "hanging");





//console.log(parent.framedata, id )


}

/*














*/
