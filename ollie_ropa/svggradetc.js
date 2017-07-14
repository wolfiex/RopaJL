var margin = { top: 0, right: 20, bottom: 30, left: 0 },
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;


var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs
    .append("radialGradient")
    .attr("id", "linear-gradient")
    .style("position", "absolute")
    .attr("x", "50%") //The x-center of the gradient, same as a typical SVG circle
    .attr("y", "50%")
    //.attr("cx", "50%")    //The x-center of the gradient, same as a typical SVG circle
    //.attr("cy", "50%")    //The y-center of the gradient
    .attr("r", "50%"); //The radius of the gradient, an offset of 100% ends where you've set this radius

//Append multiple color stops by using D3's data/enter step
linearGradient
    .selectAll("stop")
    .data([
        { offset: "0", color: "#2c7bb6" },
        { offset: "12.5", color: "#00a6ca" },
        { offset: "25", color: "#00ccbc" },
        { offset: "45.5", color: "#90eb9d" },
        { offset: "50", color: "#ffff8c" },
        { offset: "55.5", color: "#f9d057" },
        { offset: "75", color: "#f29e2e" },
        { offset: "87.5", color: "#e76818" },
        { offset: "100", color: "#d7191c" },

        { offset: "0", color: "#2c7bb6" },
        { offset: "12.5", color: "#00a6ca" },
        { offset: "25", color: "#00ccbc" },
        { offset: "45.5", color: "#90eb9d" },
        { offset: "50", color: "#ffff8c" },
        { offset: "55.5", color: "#f9d057" },
        { offset: "75", color: "#f29e2e" },
        { offset: "87.5", color: "#e76818" },
        { offset: "100", color: "#d7191c" }
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d, i) {
        if (i > 9) i - 8;
        return 40 + i * 60 / 9 + "%";
    }) //{ return ( (d.offset*.82 )+20 )+'%' })
    .attr("stop-color", function(d) {
        return d.color;
    });

var colorScale = d3
    .scaleLinear()
    .range([
        "#2c7bb6",
        "#00a6ca",
        "#00ccbc",
        "#90eb9d",
        "#ffff8c",
        "#f9d057",
        "#f29e2e",
        "#e76818",
        "#d7191c"
    ]);
