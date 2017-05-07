
// flatten using reduce
const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

///classes and defns
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



function newfile() {
  var file = "ropa_nhept33";

  let fs = require("fs");
  let data = fs.readFileSync(
    __dirname.match(/(.*\/)/)[1] + "" + file + ".nc"
  );
  reader = new netcdfjs(data);

  ncparse(reader);
}


function ncparse(reader) {
  //all parts we require from the netcdf file
  reader.dimensions.forEach(
    function(d) {
      dims[d.name] = d.size;
    },
    dims = {}
  );

  let concentration = new nc2D("concentration", "specs", Float32Array);
  let flux = new nc2D("edge-length", "fluxes", Float32Array);
  let dict = JSON.parse(reader.getDataVariable("nodes").join(""));
  let combine = JSON.parse(reader.getDataVariable("combinations").join(""));
  let tar = reader.getDataVariable("target");
  let src = reader.getDataVariable("source");
  let time = reader.getDataVariable("timeseconds");

  // creates reverse dictionary rdict below
  var rdict;
  Object.keys(dict).forEach(
    function(d) {
      var i = dict[d];
      rdict[i] = d;
    },
    rdict = {}
  );

  window.nodes = d3.range(Object.keys(dict).length).map(i => {
    var z = Math.random();
    return {
      names: rdict[i],
      id: i,
      x: 0.5 - Math.random(),
      y: 0.5 - Math.random(),
      z: 0.5 - Math.random()
    };
  });

  var links = d3.range(src.length).map((_, i) => {
    return { source: src[i], target: tar[i], v: 0.9 };
  });

  window.csvdata = [];
  window.N = [];
  window.C = [];

  var inorganics = "O,O3,O1D,O2,OH,NO,NO2,NO2N2O5,H2O2,HO2,HO2NO2,HONO,HNO3,CO,SO2,SO3,NA".split(
    ","
  );
  inorganics.forEach(function(d) {
    if (Object.keys(dict).indexOf(d) >= 0) {
      if (/^(.*[N].*)$/.test(d)) window.N.push(d);
      if (/^(.*[Cc].*)$/.test(d)) window.C.push(d);
    }
  });
/*
  d3.csv("./src/fullmcmspecs.csv", function(error, csv) {
    window.csvdata = csv;
    for (var i = 0; i < csv.length; i++) {
      var j = csv[i];
      if (Object.keys(dict).indexOf(j.item) >= 0) {
        if (/^(.*[N].*)$/.test(j.smiles)) window.N.push(j.item);
        if (/^(.*[Cc].*)$/.test(j.smiles)) window.C.push(j.item);
      }
    }
  });

  var nodes = window.C.map(function(i) {
    return {
      names: i,
      id: dict[i],
      x: 2 * (0.5 - Math.random()),
      y: 2 * (0.5 - Math.random()),
      z: 0.5 - Math.random()
    };
  });
*/
  window.data = d3.range(dims["time"]).map(i => timestep(i));
  console.log("ahhh");
  run(126);
  //load(timestep(3));
  /////////////////
  /////////////////
  /////////////////

  function timestep(t) {
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

    //normalize
    var min = d3.min(dummy);
    var max = d3.max(dummy) - min;
    mylink = mylink.map(d => (d - min + 1e-6) / max);

    // create links object
    graphlinks = [];
    for (i = 0; i < combine.length; i++) {
      if (sign[i] !== 0) {
        graphlinks.push({
          source: src[i],
          target: tar[i],
          v: Number(mylink[i].toFixed(3)),
          d: sign[i]
        });
      }
    }

    node_size = [];
    dummy = [];
    for (i = 0; i < concs.length; i++) {
      var f = concs[i];
      if (f > 0) {
        f = Math.log10(f);
        dummy.push(f);
      }
      node_size.push(f);
    }

    var min = d3.min(dummy);
    var max = d3.max(dummy) - min;

    node_size = node_size.map(d => (d - min + 1e-6) / max);

    return { links: graphlinks, node_size }; //window.nodes
  }
}
