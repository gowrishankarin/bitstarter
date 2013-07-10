var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var WEBPAGE_DEFAULT = "www.google.com";
var rest = require('restler');


var buildfn = function() {
	var response2console = function(result, response) {
		var fileObj = {};
		if(result instanceof Error) {
			console.error('Error: ' + util.format(response,message))
		} else {
			
			fileObj = fs.writeFileSync("url.html", result);
		}
		return fileObj;
	};
	return response2console;
};




var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var assertWebpageExists = function(url) {
	var fd = {};
	if(!fs.existsSync("url.html")) {
		fd = fs.openSync("url.html", 'w');
	}
	
	var response2console = buildfn();
	var urlObj = rest.get(url, {}).on('complete', function(data) {
		fs.writeFileSync("url.html", data);
		console.log("Writing Completed");
	});
	
	console.log("Testing Write");
	return assertFileExists("url.html");
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	console.log("Checking Html File");
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var checkUrl = function(url, checksfile) {
	if(!fs.existsSync("url.html")) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return checkHtmlFile(url, checksfile);
}

var clone = function(fn) {
	return fn.bind({});
};


if(require.main == module) {
	program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_file>', 'Web page address', clone(assertWebpageExists), WEBPAGE_DEFAULT)
	.parse(process.argv);
	
	console.log(program.file);
	console.log(program.checks);
	console.log(program.url);
	var checkJson = {};
	
	checkJson = checkUrl(program.url, program.checks);
	
	
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
} else {
	exports.checkHtmlFile = checkHtmlFile;
}