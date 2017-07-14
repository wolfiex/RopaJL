function radial(data, islast, labels, desc, conc) {
    var max = 1; //d3.max(data.map(d => d3.max(d)));
    var min = 0; //d3.min(data.map(d => d3.min(d)));

    d3.range(data[0].length).forEach((i, freq) => {
        var td = data.map(d => d[freq]);
        var npts = td.length;
        var angle = 2 * Math.PI / npts;

        var h = d3
            .scaleLinear()
            .range([
                desc === "loss" ? 30 + rmax / 2 - 10 : 30 + rmax / 2 + 10,
                desc === "loss" ? 30 : rmax + 10
            ])
            .domain([min, max]);
        var adj = 0.75 * 2 * Math.PI;

        var area = d3
            .line()
            .curve(d3.curveCardinalClosed) //d3.curveCardinalClosed
            .x(function(d, i) {
                i += 1;
                return width / 2 + Math.cos(i * angle + adj) * h(d);
            }) //.x0(function(d,i) { return width/2+Math.cos(i*angle)*(armax+h(mean)) })            //.y0(function(d,i) { return height/2+Math.sin(i*angle)*(armax+h(mean)) })
            .y(function(d, i) {
                i += 1;
                return height / 2 + Math.sin(i * angle + adj) * h(d);
            });

        var isimportant = false;
        if ((d3.mean(td) >0.1) ) isimportant = true;

        print("adjusting the  time of spiral, check this is not changed");

        clip = defs
            .append("clipPath")
            .attr("id", "clip" + i + desc)
            .append("path")
            .data([td.map(d => (desc === "loss" ? 0.95 * d : 1.01 * d))])
            .attr("class", "area")
            .attr("d", area);

        var mask = defs.append("mask").attr("id", "myMask" + i + desc);

        mask
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .style("fill", "white")
            .style("opacity", 0.97);

        mask
            .append("path")
            .data([td]) //.attr("class", "area")
            .attr("d", area);

        circle = svg
            .append("circle")
            .attr("id", "circ" + i + desc)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", desc === "loss" ? rmax : rmax + 30)
            .attr("class", "circle")
            .attr("mask", "url(#myMask" + i + desc + ")")
            .attr("clip-path", "url(#clip" + i + desc + ")")
            .style("fill", "url(#linear-gradient)")
            .style("stroke", "white");


print(labels)

        /*
        svg
            .append("circle")
            .attr("id", "center")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr(
                "r",
                desc === "loss"
                    ?  30 + rmax/2-10
                    :  30+ rmax/2+ 10
            )
            .attr("class", "circle")
            .style("fill", "None")
            .style("stroke-width", 3)
            .style("stroke", "white");
            
            */

        //text

        svg
            .append("path")
            .data([td])
            .attr("id", "main" + i + desc)
            .attr("class", "line")
            .attr("d", area);
        
        text = svg
            .append("text")
            .append("textPath") //append a textPath to the text element
            
            .attr("xlink:href", "#" + "main" + i + desc) //place the ID of the path here
            //.style("text-anchor","top") //place the text halfway on the arc
            
            .attr("id", labels[i])
            .attr("startOffset", "10%")
            .style("font-size", 8)
            .style("oppacity", 0.15)
            .style("fill", "white")
            .text(isimportant?labels[i]:'')
            
            .style('pointer-events', 'all')
            .on('click',function(d, i){ 
        d = d3.select(this) 
        print (d)
        d.remove()
        d.attr("startOffset", "44%")
    
        
            
    })
            
            
            ///.call(d3.drag()                .on("start", dragstarted)                .on("drag", dragged)                .on("end", dragended));
            
            
            
    });
}




function concentration() {
    var conc = c;

    //var angle = 2 * Math.PI / parseFloat(monthData.length);

    var adj = 0.75 * 2 * Math.PI;
    /*
    svg
        .selectAll(".monthConc")
        .data(monthData)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            i += 1;
            return width / 2 + Math.cos(i * angle + adj) * rmax * 1.1;
        })
        .attr("cy", function(d, i) {
            i += 1;
            return height / 2 + Math.sin(i * angle + adj) * rmax * 1.1;
        })
        .attr("class", "monthConc")
        //.attr("cx", d=>{print('www',d);return 100}) //Move the text from the start angle of the arc
        //.attr("cy", 18) //Move the text down
        .style("fill", "white")
        .style("opacity", 0.7)
        .style("r", d => 35 * Math.pow(conc[d.month * 144 / 24], 1.5));
*/
var npts = conc.length;
    var angle = 2 * Math.PI / npts;


////
    var h = d3
        .scaleLinear()
        .range([1.2 * rmax + 50.5, 1.2 * rmax + 70.5])
        .domain([0, 1]);

    var area = d3
        .line()
        .curve(d3.curveCardinalClosed) //d3.curveCardinalClosed
        .x(function(d, i) {
            i += 1;
            return width / 2 + Math.cos(i * angle + adj) * h(d);
        })
        //.x0(function(d,i) { return width/2+Math.cos(i*angle)*(armax+h(mean)) })
        //.y0(function(d,i) { return height/2+Math.sin(i*angle)*(armax+h(mean)) })
        .y(function(d, i) {
            i += 1;
            return height / 2 + Math.sin(i * angle + adj) * h(d);
        });

    svg
        .append("path")
        .data([conc.concat(conc.map(d=>0))])
        //.data([td])
        .attr("id", "concs")
        .attr("class", "path")
        .attr("d", area)
        .style("stroke", "pink")
        .style('fill-rule','evenodd')
        .style("fill", "purple")
        .style('opacity','0.5')



////////////

    //prod - loss
    totalratiop = fluxes.map(d => {
        return d3.sum(d[0]);
    });
    totalratiol = fluxes.map(d => {
        return -d3.sum(d[1]);
    });

    var h = d3
        .scaleLinear()
        .range([1.2 * rmax + 30.5, 1.2 * rmax + 50.5])
        .domain([0, d3.max([d3.max(totalratiop), d3.max(totalratiol)])]);

    var area2 = d3
        .line()
        .curve(d3.curveCardinalClosed) //d3.curveCardinalClosed
        .x(function(d, i) {
            i += 1;
            return width / 2 + Math.cos(i * angle + adj) * h(0.5 + d / 2);
        })
        //.x0(function(d,i) { return width / 2 + Math.cos(i * angle + adj) * h(0.5 ) })
        //.y0(function(d,i) { return height / 2 + Math.sin(i * angle + adj) * h(0.5 + d / 2) })
        .y(function(d, i) {
            i += 1;
            return height / 2 + Math.sin(i * angle + adj) * h(0.5 + d / 2);
        });

    svg
        .append("path")
        .data([totalratiop.concat(totalratiop.map(d=>0.5))])
        //.data([td])
        .attr("id", "totalflux")
        .attr("class", "path")
        .attr("d", area2)
        .style("stroke", "red")
        .style('fill-rule','evenodd')
        .style("fill", "red")
        
        .style('fill-opacity',0.4)
        .style("stroke-width", 1);

    h.range([1.2 * rmax + 30.5, 1.2 * rmax + 0.5]);

    var area2 = d3
        .line()
        .curve(d3.curveCardinalClosed) //d3.curveCardinalClosed
        .x(function(d, i) {
            i += 1;
            return width / 2 + Math.cos(i * angle + adj) * h(0.5 - d / 2);
        })
        //.x0(function(d,i) { return width/2+Math.cos(i*angle)*(armax+h(mean)) })
        //.y0(function(d,i) { return height/2+Math.sin(i*angle)*(armax+h(mean)) })
        .y(function(d, i) {
            i += 1;
            return height / 2 + Math.sin(i * angle + adj) * h(0.5 - d / 2);
        });

    svg
        .append("path")
        .data([totalratiol.concat(totalratiol.map(d=>0.5))])
        //.data([td])
        .attr("id", "totalflux")
        .attr("class", "path")
        .attr("d", area2)
        .style("stroke", "blue")
        .style('fill-rule','evenodd')
        .style('fill-opacity',0.3)
        .style("fill", "#1C36EE")
        .style("stroke-width", 1);

    /*
print (h.range())
h.range().forEach(d=>{    
            svg
                .append("circle")
                .attr("id", "center"+d)
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr(
                    "r",d
                )
                .attr("class", "circle")
                .style("fill", "None")
                .style("stroke-width", 1)
                .style("stroke", "white");
                
            })

*/
}


function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.x = d.x;
  d.y = d.y;
}

function dragged(d) {
    print(d)
  d.style('startOffset', '100%')//d3.event.x;
  d.cy = d3.event.y;
  //.attr("startOffset", "10%")
  //.style("font-size", 8)
}


function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.x = null;
  d.y = null;
}