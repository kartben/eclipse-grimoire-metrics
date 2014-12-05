var fs = require('fs');

res = {}
fs.readdir('.', function (err, files) { 
    if (!err) {
        files.forEach(function (f) {
            res[f] = require('./' + f)
        });
    } 
    else
        throw err; 
});

console.log(res)

fs.writeFile('all.json', JSON.stringify(res, null, 4));