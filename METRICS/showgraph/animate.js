class nc2D {
  constructor(name, width, arr_type) {
    //Float32Array
    this.width = dims[width];
    this.arr_type = arr_type;
    this.data = new arr_type(reader.getDataVariable(name));
  }
}
nc2D.prototype.row = function(index) {
  var start = index * this.width;
  return new this.arr_type(this.data.slice(start, start + this.width));
};

function ncparse(reader) {
  //all parts we require from the netcdf file
  reader.dimensions.forEach(
    function(d) {
      dims[d.name] = d.size;
    },
    dims = {}
  );
  const concentration = new nc2D("concentration", "specs", Float32Array);
  const flux = new nc2D("edge-length", "fluxes", Float32Array);
  const dict = JSON.parse(reader.getDataVariable("nodes").join(""));
  const combine = JSON.parse(reader.getDataVariable("combinations").join(""));
  const tar = reader.getDataVariable("target");
  const src = reader.getDataVariable("source");
  const time = reader.getDataVariable("timeseconds");

  // creates reverse dictionary rdict below
  var rdict, nodes, i;
  Object.keys(dict).forEach(
    function(d) {
      var i = dict[d];
      rdict[i] = d;
    },
    rdict = {},
    nodes = []
  );

  window.nodes = [];
  for (i = 0; i < combine.length; i++) {
    window.nodes.push({
      names: rdict[i],
      id: i,
      x: 2 * (0.5 - Math.random()),
      y: 2 * (0.5 - Math.random()),
      z: 0.5 - Math.random()
    });
  }

  const formatTime = d3.timeFormat("%b %d, %H:%M");
  //time => datetime
  const datetime = time.map(function(e) {
    var utcSeconds = e;
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(utcSeconds);
    return d;
  });

  window.ncdata = {
    concentration,
    flux,
    dict,
    rdict,
    combine,
    tar,
    src,
    formatTime,
    datetime,
    dims
  };

  d3.range(1, dims["time"]);

  [6].forEach(t => {
    var edge_len = flux.row(t);
    var concs = concentration.row(t);

    combine.forEach(
      function(f) {
        var prod = new Set(f[0]);
        var loss = new Set(f[1]);

        var flx = 0;

        prod.forEach(function(i) {
          var j = edge_len[i];
          if (isFinite(j)) {
            flx -= j;
          }
        });
        loss.forEach(function(i) {
          var j = edge_len[i];
          if (isFinite(j)) {
            flx -= j;
          }
        });

        sign.push(Math.sign(flx));
        flx = Math.log10(Math.abs(flx));
        mylink.push(flx);
        if (isFinite(flx)) dummy.push(flx);
      },
      mylink = [],
      dummy = [],
      sign = []
    );

    var ids = data.nodes.map(d => d.id);

    var min = d3.min(dummy);
    var max = d3.max(dummy) - min;
    mylink = mylink.map(d => (d - min + 1e-6) / max);

    graphlinks = [];
    for (i = 0; i < combine.length; i++) {
      if (sign[i] !== 0) {
        /// need to keep size the same

        //if (ids.indexOf(src[i]) > -1 && ids.indexOf(tar[i]) > -1) {
        graphlinks.push({
          source: src[i],
          target: tar[i],
          v: Number(mylink[i].toFixed(3)),
          d: sign[i]
        });
        //    }
      }
    }

    console.log({ links: graphlinks, nodes: data.nodes });
    //data.links = graphlinks;
    gradedge({ links: graphlinks, nodes: data.nodes });

    nodes.forEach(f => {
      d3.select("#node" + f.id).attr("r", 100);
    });
  });
}

function newfile() {
  file = "nhept";

  const fs = require("fs");
  const data = fs.readFileSync(
    __dirname.match(/(.*\/)/)[1] + "netcdf_results/" + file + ".nc"
  );
  reader = new netcdfjs(data);
  ncparse(reader);
}
draw();
newfile();
