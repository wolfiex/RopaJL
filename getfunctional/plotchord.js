function plot() {


    var svg = d3.select("svg"),
        width = +svg.attr("width") / 2,
        height = +svg.attr("height") / 2,
        outerRadius = Math.min(width, height) * 0.5 - 40,
        innerRadius = outerRadius - 20;



    var formatValue = d3.formatPrefix(",.0", 1);

    window.chord = d3.chord()
        .padAngle(0.05)
        .sortGroups(d3.ascending)
        .sortSubgroups(d3.ascending)
        .sortChords(d3.ascending)
        



    var ribbon = d3.ribbon()
        .radius(innerRadius);



    var colorcat = d3.scaleOrdinal(d3.schemeCategory10);


    window.colorvir = ColourScheme(viridis, inverse = false, test = false)


    window.color = d3.scaleOrdinal()        .domain(d3.range(matrix[0].length))      
    
    
      .range(["#301E1E", "#083E77", "#342350", "#567235", "#8B161C", "#DF7C00"], )

      .range(["#0B002B", "#190E3F", "#241F6B", "#337BBF", "#3DBBFF",],)
    //.domain(d3.range(matrix[0].length))
//.range(viridis);
    //['#ca0020', '#f4a582', '#f7f7f7', '#92c5de', '#0571b0']

//main links 
    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .datum(chord(matrix))
        .on('click',d=>p(d));

    var group = g.append("g")
        .attr("class", "groups")
        .selectAll("g")
        .data(function(chords) {
            return chords.groups;
        })
        .enter().append("g");



    //Function to create the unique id for each chord gradient
    function getGradID(d) {
        return "linkGrad-" + d.source.index + "-" + d.target.index;
    }

    //Create the gradients definitions for each chord
    var grads = svg.append("defs").selectAll("linearGradient")
        //had a data property here 
        .data(chord(matrix))
        .enter().append("linearGradient")
        //Create the unique ID for this specific source-target pairing
        .attr("id", getGradID)
        .attr("gradientUnits", "userSpaceOnUse")
        //Find the location where the source chord starts
        .attr("x1", function(d, i) {
            return innerRadius * Math.cos((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2);
        })
        .attr("y1", function(d, i) {
            return innerRadius * Math.sin((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2);
        })
        //Find the location where the target chord starts 
        .attr("x2", function(d, i) {
            return innerRadius * Math.cos((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2);
        })
        .attr("y2", function(d, i) {
            return innerRadius * Math.sin((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2);
        })

    //Set the starting color (at 0%)
    grads.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", function(d) {
            return color(d.source.index);
        });

    //Set the ending color (at 100%)
    grads.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", function(d) {
            return color(d.target.index);
        });




    window.c = chord(matrix);


    //var colours = d3.scale.category10();
    //var colourValue = function(d, i) { return d; };


['source','target'].map(what=>{
c.forEach((current,x)=>{
    
    window.x = x

current = current[what]
diff = current.endAngle - current.startAngle

//p(x,current)
i = current.index
j = current.subindex

window.bar = Array(max+1).fill(0)

matrix1[i][j].forEach(e=>{
    if (e[1] * e[2]) {bar[e[1]]+=1}
})

m =d3.max(bar)


var perarc = d3.arc()
    .innerRadius(outerRadius -5)
    .outerRadius(outerRadius +0)
    .cornerRadius(1)
    .startAngle(current.startAngle)

    var newg = g.append("g")
      .attr('id',''+x)
      .attr("class", 'g'+x)
      .selectAll('path')
      .data(bar.map(e=>0.95*parseFloat(e)/m))
      .enter()
      
      
    newg
    .append("path")
    .each(arcFunction)
    .style("fill",(d,i)=>colorvir(1-i/max))// function(d) { return colours(colourValue(d));});
    .attr("id", function(d, i) {
        p('x'+window.x+'e'+i+'aaa')
        return 'x'+window.x+'e'+i+'aaa';
    })
    .attr('stroke','white') //Give each slice a unique ID

p(x,bar.map(e=>0.9*parseFloat(e)/m))
    
// Function called for each path appended to increase scale and iterate.
    function arcFunction(d, i) {
        return d3.select(this)
            .transition()
            //.ease("easeBounce")
            .duration(1200)
            .attr("d", perarc.endAngle(current.startAngle + diff * d))

            .attr("transform", "scale(" + (1+i/60) + ")");

    }


})

})



///outer rim 

var cornerRadius = 3

var arc = d3.arc()
    .innerRadius(innerRadius + 2)
    .outerRadius(outerRadius - 7)
    .cornerRadius(cornerRadius);

group.append("path")
    .style("fill", function(d) {
        return color(d.index);
    })
    .style("stroke", function(d) {
        return 'white';
        d3.rgb(color(d.index)).darker();
    })
    .attr("id", function(d, i) {
        return Object.keys(groups)[i];
    }) //Give each slice a unique ID
    .attr("d", arc)
    .on('mouseover', (d, i) => console.log(Object.keys(groups)[i]))

var arc = d3.arc()
    .innerRadius(outerRadius - 7)
    .outerRadius(outerRadius - 4)
    .cornerRadius(1);

group.append("path")
    .style("fill", function(d) {
        return color(d.index);
    })
    .style("stroke", function(d) {
        return 'white';
        d3.rgb(color(d.index)).darker();
    })
    .attr("id", function(d, i) {
        return Object.keys(groups)[i];
    }) //Give each slice a unique ID
    .attr("d", arc)
    .on('mouseover', (d, i) => console.log(Object.keys(groups)[i]))


var arc = d3.arc()
    .innerRadius(outerRadius - 7)
    .outerRadius(outerRadius - 4)
    .cornerRadius(1);

group.append("path")
    .style("fill", function(d) {
        return color(d.index);
    })
    .style("stroke", function(d) {
        return 'white';
        d3.rgb(color(d.index)).darker();
    })
    .attr("id", function(d, i) {
        return Object.keys(groups)[i];
    }) //Give each slice a unique ID
    .attr("d", arc)
    .on('mouseover', (d, i) => console.log(Object.keys(groups)[i]))



///text labels


group.selectAll(".monthText")

    //.attr('transform','translate('+width/2+','+height/2+')')
    .data(Object.keys(groups))
    .enter().append("text")

    .attr("class", "monthText")

    .attr("font-size", function(d, i) {
        return (matches[i].size / d3.sum(matches.map(d => d.size)) < .05) ? 5 + 'px' : 18 + "px"
    })
    .attr('fill','white')
    .attr('stroke-width',1)
    .attr('stroke','#222')
    .attr("x", 30) //Move the text from the start angle of the arc
    .attr("dy", -50) //Move the text down
    .append("textPath")
    .attr("xlink:href", function(d, i) {
        return "#" + d
    })
    .text(function(d) {
        return d;
    })
    







minthresh = .05

///ticks

var groupTick = group.selectAll(".group-tick")
    .data(function(d) {
        return groupTicks(d, 5e2);
    })
    .enter().append("g")
    .attr("class", "group-tick")
    .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + (outerRadius+10) + ",0)";
    });

groupTick.append("line")
    .attr("x2", 6);


groupTick
    .filter(function(d) {
        return d.value % 1 === 0;
    })
    .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function(d) {
        return d.angle > Math.PI ? "rotate(180) translate(-16)" : null;
    })
    .style("text-anchor", function(d) {
        return d.angle > Math.PI ? "end" : null;
    })
    .text(function(d) {
        return formatValue(d.value);
    })
    .attr("font-size", function(d, i) {
        return 10 + "px";
    })


//////chord ribbons

g.append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(function(chords) {
        return chords;
    })
    .enter().append("path")
    .attr("d", ribbon)
    .style("fill", function(d) {
        return color(d.target.index);
    })

    .style("fill", function(d) {
        return "url(#" + getGradID(d) + ")";
    })

    .style('opacity', d => (d.source == d.target) ? 0.1 : .7)
    .style("stroke", function(d) {
        return color(d.target.index).lighter() //.darker();
    })

    .on('mouseover', (d, i) => {
        console.log(d, i)
    })






// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
        return {
            value: value,
            angle: value * k + d.startAngle
        };
    });
}


}