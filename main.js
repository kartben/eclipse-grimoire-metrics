var data = require('./all.json');
var moment = require("moment");
var Spreadsheet = require('edit-google-spreadsheet');

// Goal is to end up with a structure like the following

// date			projectname opened_tickets	closed_tickets	...
// 2014-01-01	californium	10				12				...
// 2014-02-01	californium	10				12				...
// ...

var REGEXP = /iot\.(.+?)-.*evolutionary.json/;

// number of full months elapsed since Jan-1 2001
var months = moment(). /*startOf('month').subtract(1, 'day').*/ diff(moment([2001, 0, 1]), 'months') + 1;

var SCM_FIELDS = ['authors', 'commits'];
var ITS_FIELDS = ['opened', 'closed'];
var MLS_FIELDS = ['sent', 'senders'];

var result = {}

for (var key in data) {
	if (REGEXP.test(key)) {

		var projectName = key.match(REGEXP)[1];
		result[projectName] = result[projectName] || {};

		console.log(projectName, ' - ', key);

		var fields = []

		// Source code repo
		if (key.indexOf('-scm-') > -1) {
			fields = SCM_FIELDS;
		}

		// Bugzilla
		else if (key.indexOf('-its-') > -1) {
			fields = ITS_FIELDS;
		}

		// Mailing list
		else if (key.indexOf('-mls-') > -1) {
			fields = MLS_FIELDS;
		}

		for (month = 0; month < months; month++) {
			month_str = moment([2001, 0, 1]).add(month, 'month').endOf('month').format('YYYY-MM-DD');

			result[projectName][month_str] = result[projectName][month_str] || {}

			fields.forEach(function(field) {
				result[projectName][month_str][field] = data[key][field][month];
			});

		}
	}
}

var spreadsheetRows = [];

var ALL_FIELDS = SCM_FIELDS.concat(ITS_FIELDS).concat(MLS_FIELDS);

var HEADER = ['project', 'date'].concat(ALL_FIELDS).concat(['senders_365', 'percentage_senders_365', 'authors_365', 'percentage_authors_365']);

spreadsheetRows.push(HEADER);

for (var p in result) {
	var project = result[p];

	// try and get the senders_365 & percentage in "iot.{projectName}-mls-prj-static.json"
	staticMls = data['iot.' + p + '-mls-prj-static.json']
	var senders_365 = 0,
		percentage_senders_365 = 0;
	if (staticMls) {
		senders_365 = staticMls.senders_365;
		percentage_senders_365 = staticMls.percentage_senders_365 * (staticMls.diff_netsenders_365 > 0 ? 1 : -1) / 100;
	}


	// try and get the authors_365 & percentage in "iot.{projectName}-scm-prj-static.json"
	staticScms = data['iot.' + p + '-scm-prj-static.json']
	var authors_365 = 0,
		percentage_authors_365 = 0;
	if (staticScms) {
		authors_365 = staticScms.authors_365;
		percentage_authors_365 = staticScms.percentage_authors_365  * (staticScms.diff_netauthors_365 > 0 ? 1 : -1) / 100;
	}

	for (var d in project) {
		// start in 2012
		if (parseInt(d.substring(0, 4)) < 2012)
			continue;

		var date = project[d];
		var row = [p, d];

		ALL_FIELDS.forEach(function(f) {
			if (typeof date[f] == 'undefined')
				row.push(0);
			else
				row.push(date[f]);
		})

		row.push(senders_365);
		row.push(percentage_senders_365);
		row.push(authors_365);
		row.push(percentage_authors_365);

		spreadsheetRows.push(row);
	}
}

Spreadsheet.load({
	debug: false,
	spreadsheetId: '1MT8vUectDG7qnt83LBts-B7oECMsICXyB4Tn4Kxl64U',
	worksheetId: 'od6',
	//	username: username,
	//	password: password,	
	oauth: {
		email: '994193235180-598b5b2t21ms6nra6c4ej63sv5q2aem9@developer.gserviceaccount.com',
		keyFile: '/Users/kartben/Downloads/key.pem'
	},
}, function sheetReady(err, spreadsheet) {
	spreadsheet.add({
		1: spreadsheetRows
	});
	//console.log(spreadsheet);
	spreadsheet.send(function(err) {
		if (err) {
			throw err;
		}
	});
});