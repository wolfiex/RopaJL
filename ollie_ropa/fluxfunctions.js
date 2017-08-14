function get_data(filename, spec) {
    ncparse(filename);

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

    pnames = prod.map(d => ncdata.rates[d]);
    lnames = loss.map(d => ncdata.rates[d]);

    var conc = [];

    window.fluxes = d3.range(144).map(timestep => {
        var currentrow = ncdata.flux.row(timestep);
        var p = prod.map(e => 1.4 * currentrow[e]);
        var l = loss.map(e => 1.4 * currentrow[e]);

        conc.push(ncdata.concentration.row(timestep)[specindex]);
        return [p, l, d3.extent(p.concat(l))];
    });

    totalmax = d3.max(window.fluxes.map(q => q[2][1]));

    conc = conc.map(d => {
        var z = Math.log10(d);
        return isFinite(z) ? z : Infinity;
    });

    var min = d3.min(conc);
    conc = conc.map(d => d - min + 1e-18);

    var maxc = d3.max(conc);
    conc = conc.map(d => d / maxc);

    
    data = fluxes.map(d =>
        d[0].map(w => ( w / d[2][1]))
    );
    radial(data, false, pnames, "prod", conc);
    
    data1 = fluxes.map(d =>
        d[1].map(w => (w / d[2][1]))
    );
    radial(data1, false, lnames, "loss", conc);
    
    window.c = conc

    return [pnames, lnames, window.fluxes, totalmax];
}
