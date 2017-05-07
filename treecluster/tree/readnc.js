q

  window.csvdata = [];
  window.N = [];
  window.C = [];

  var inorganics = "O,O3,O1D,O2,OH,NO,NO2,NO2N2O5,H2O2,HO2,HO2NO2,HONO,HNO3,CO,SO2,SO3,NA".split(
    ","
  );
  inorganics.forEach(function(d) {
    if (Object.keys(ncdata.dict).indexOf(d) >= 0) {
      if (/^(.*[N].*)$/.test(d)) window.N.push(d);
      if (/^(.*[Cc].*)$/.test(d)) window.C.push(d);
    }
  });

  d3.csv("./src/fullmcmspecs.csv", function(error, csv) {
    window.csvdata = csv;
    for (var i = 0; i < csv.length; i++) {
      var j = csv[i];
      if (Object.keys(ncdata.dict).indexOf(j.item) >= 0) {
        if (/^(.*[N].*)$/.test(j.smiles)) window.N.push(j.item);
        if (/^(.*[Cc].*)$/.test(j.smiles)) window.C.push(j.item);
      }
    }

    console.log("loaded");
    draw();
    //load1();
  });
}
