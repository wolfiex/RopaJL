 // Network code from: Mike Bostock's example https://bl.ocks.org/mbostock/4062045
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const color = {
      "3": "#e4b0b0",
      "1": "#E8336D",
      "8": "#00897b"
    }

    const circlePadding = 20

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id( d => d.id ))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        
    d3.json("miserables.hidden.json", function(error, graph) {
      if (error) throw error;
      const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
          .attr("stroke-width", d => Math.sqrt(d.value));
      const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d => color[d.group + ''] || 'lightgrey')
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

      node.append("title")
        .text(d => d.id)

      simulation
        .nodes(graph.nodes)
        .on("tick", ticked);
      
      simulation.force("link")
        .links(graph.links);
      
      function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        makeAnnotations.annotations()
        .forEach((d, i) => {
            points = graph.nodes
              .filter(d => d.group === groups[i])
              .map(d => ({ x: d.x, y: d.y, r: 5}))
            circle = d3.packEnclose(points)
            d.position = { x: circle.x, y: circle.y }
            d.subject.radius = circle.r + circlePadding            
          })        
        makeAnnotations.update()
      }

    let groups = [3, 1, 8]
    let points = groups.map(p => graph.nodes
      .filter(d => d.group === p)
      .map(d => ({ x: d.x, y: d.y, r: 5 })))

    let circle = points.map( p => d3.packEnclose(p))
    const annotations = [{
        note: { label: "Group 3",
        title: "Les Mis" },
        dy: 93,
        dx: -176,
        x: circle[0].x,
        y: circle[0].y,
        type: d3.annotationCalloutCircle,
        subject: {
          radius: circle[0].r + circlePadding,
          radiusPadding: 10
        }
    },
    {
        note: { label: "Group 1",
        title: "Les Mis"},
        dy: 93,
        dx: -176,
        x: circle[1].x,
        y: circle[1].y,
        type: d3.annotationCalloutCircle,
        subject: {
          radius: circle[1].r + 20,
          radiusPadding: 10
        }
    },
    {
        note: { label: "Group 8",
        title: "Les Mis"},
        dy: 93,
        dx: 176,
        x: circle[2].x,
        y: circle[2].y,
        type: d3.annotationCalloutCircle,
        subject: {
          radius: circle[2].r + 20,
          radiusPadding: 10
        }
    }
    ]

     window.makeAnnotations = d3.annotation()
        .annotations(annotations)
        .accessors({ x: d => d.x , y: d => d.y})

      svg.append("g")
        .attr("class", "annotation-encircle")
        .call(makeAnnotations)

    });

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }