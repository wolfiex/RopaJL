
    function fromgroups() {
        ispecs = new Map(data.map(d => {
            return [d.name, d]
        }))

        window.perspec = specieslist.map(s => {
            try {
                matches = Object.keys(groups).map(g => {
                    var reg = new RegExp(groups[g], 'gi');
                    m = ispecs.get(s).smiles.match(reg)
                    return m === null ? 0 : m.length
                })
                
                //matches push all
                d3.sum(matches) > 0 ? matches.push(0) : matches.push(d3.sum(matches))
                return matches
            } catch (err) {
                p(s, err.message)
            }
        })
        //p(window.perspec)
        str = 'name,' + Object.keys(groups).join(',') + ",nogroups" + "\n"

        specieslist.forEach((d, i) => {
            str += d + ',' + window.perspec[i].join(',') + "\n"
        })


        var fs = require('fs');
        ///*
        fs.writeFile('groupings.csv', str, function(err, file) {
            if (err) throw err;
            console.log('Saved!');
        });
        //  */

    }


