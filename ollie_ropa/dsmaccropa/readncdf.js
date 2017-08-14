//classes and defns
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

var print = d => console.log(d);



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
  const rates = JSON.parse(reader.getDataVariable("rate").join(""));

  // creates reverse dictionary rdict below

document.getElementById("valueslider").max=dims.time


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
    dims,
    rates
  };

  //populate slider options
  document.getElementById("valueslider").max = dims.time - 1;

  var select = document.getElementById("dropdown");
  var names = Object.keys(dict).sort();

  names.forEach(i => {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt);
  });

  draw(spec, timestep);
}
