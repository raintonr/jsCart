var http = require("http");
var genericSession = require("generic-session");
var sessionStore = genericSession.MemoryStore();

/* Start the 'backend' server */

var backendPort = 3031; 
require("./Backend").createServer(backendPort);

/* Start the 'CMS' server */

var cmsPort = 3032; 
require("./CMS").createServer(cmsPort);

/* Start our 'frontend' server */

var port = 3030;
console.log("Starting on %d...", port);

http.createServer(function(req, res) {
	var session = genericSession(req, res, sessionStore);
	if (req.method == "POST") {
		handle_post(req, res, session);
	} else {
		handle_get(req, res, session);
	}
}).listen(port);

function handle_post(req, res, session) {
	var data = "";
	req.on("data", function(chunk) {
        data += chunk;
    });
    req.on("end", function() {
        console.log("raw: " + data);
        session.set("cart", data, function(){
        	res.end();
        });
    });
}

function handle_get(req, res, session) {
	/*
	 * See if we should be pulling something from store
	 */
	if (req.url == "/get") {
		session.get("cart", function(err, data){
			res.end(data);
		});
	} else {
		/* Nope - just serve up some files from the CMS*/
		serveFromCms(req, res);
	}
}

function serveFromCms(reqIn, resIn) {
	var req = http.get("http://localhost:" +cmsPort + reqIn.url);
	req.on('response', function(res) {
		console.log('Response from CMS');
		var body = "";
		res.on('data', function(chunk){
			body += chunk;
		});
		res.on("end", function() {
			handleQos(resIn, body);
		});
	});
}

var qos = 250;
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var request = require("request");
var async = require("async");
function handleQos(res, body) {
	var funcs = [];
	
	$ = cheerio.load(body);
	$(".qosTemplate").each(function(){
		funcs.push($(this));
	});
	
	async.each(funcs, function(item, callback){
		replaceQos(item, $, callback);
	}, function(){
		body = $.html();
		finishReq(res, body);
	});
}

function replaceQos($target, $, callback) {
	var req = http.get("http://localhost:" +backendPort + $target.attr("model"));
	req.on('error', function(err) {
		console.log('Error: ' + err.message);
		callback();
	});
	req.on('response', function(res) {
		console.log('Response from Backend');
		var data = "";
		res.on('data', function(chunk){
			data += chunk;
		});
		res.on("end", function() {
			console.log("Read from server: " + data);
			var source = $("#" + $target.attr("template")).html();
			console.log("Compiling template: " + source);
			template = Handlebars.compile(source);
			model = JSON.parse(data);
			$target.html(template(model));
			$target.attr("qosDone", "1");
			callback();
		});
	});
	req.setTimeout(qos, function(){
		console.log("Timeout!");
		req.abort();
	});
}

function finishReq(res, body) {
	res.writeHead(200, {
		"Content-Length" : body.length
	});
	res.write(body);
	res.end();
}