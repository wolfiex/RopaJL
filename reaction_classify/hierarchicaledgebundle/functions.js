function markers(){
    d3
    .select("svg")
    .append("defs")
    .selectAll("marker")
    .data([
        {
            id: 0,
            name: "circle",
            path: "M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0",
            viewbox: "-6 -6 12 12"
        },
        {
            id: 1,
            name: "square",
            path: "M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z",
            viewbox: "-5 -5 10 10"
        },
        {
            id: 2,
            name: "arrow",
            path: "M 0,0 m -5,-5 L 5,0 L -5,5 Z",
            viewbox: "-5 -5 10 10"
        },
        {
            id: 3,
            name: "stub",
            path: "M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z",
            viewbox: "-1 -5 2 10"
        }
    ])
    .enter()
    .append("svg:marker")
    .attr("id", function(d) {
        return d.name;
    })
    .attr("markerHeight", 6)
    .attr("markerWidth", 4)
    .attr("markerUnits", "strokeWidth")
    .attr("orient", "auto")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("viewBox", function(d) {
        return d.viewbox;
    })
    .append("svg:path")
    .attr("d", function(d) {
        return d.path;
    }).attr("opacity", 0.7)
    .attr("fill", '#222');
}

function mouseovered(d) {
  node.each(function(n) {
    n.target = n.source = false;
  });

  link
    .classed("link--target", function(l) {
      if (l.target === d) return l.source.source = true;
    })
    .classed("link--source", function(l) {
      if (l.source === d) return l.target.target = true;
    })
    .filter(function(l) {
      return l.target === d || l.source === d;
    })
    .each(function() {
      this.parentNode.appendChild(this);
    });

  node
    .classed("node--target", function(n) {
      return n.target;
    })
    .classed("node--source", function(n) {
      return n.source;
    });
}

function mouseouted(d) {
  console.log("mouseout", d.data.name);
  link.classed("link--target", false).classed("link--source", false);

  node.classed("node--target", false).classed("node--source", false);
}

d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || { name: name, children: [] };
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {}, imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.data.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.data.imports)
      d.data.imports.forEach(function(i, n) {
        imports.push({
          source: map[d.data.name],
          target: map[i],
          weight: d.data.value.reaction[n]
        });
      });
  });

  return imports;
}


var diameter = d3.min([window.innerWidth, window.innerHeight]),
  radius = diameter / 2,
  innerRadius = radius - 120;

var cluster = d3.cluster().size([360, innerRadius]);

const line = d3
  .radialLine()
  .radius(function(d) {
    return d.y;
  })
  .angle(function(d) {
    return d.x / 180 * Math.PI;
  })
  .curve(d3.curveBundle.beta(tension));//0.95

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", diameter)
  .attr("height", diameter)
  .append("g")
  .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
  node = svg.append("g").selectAll(".node");



