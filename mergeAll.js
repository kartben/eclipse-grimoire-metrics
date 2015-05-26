var fs = require('fs');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

res = {}
var DIR = './dashboard.eclipse.org/data/json/';
var files = fs.readdirSync(DIR);

files.forEach(function (f) {
	if(!f.endsWith('json')) return ;
	console.log(f);
    res[f] = require(DIR + f)
});

fs.writeFile('all.json', JSON.stringify(res, null, 4));

