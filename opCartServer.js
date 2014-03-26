var http = require("http");
var fs = require("fs");
var path = require("path");
var genericSession = require("generic-session");
var sessionStore = genericSession.MemoryStore();

/* Start the 'backend' server */

require("./Backend").createServer();

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
		/* Nope - just serve up some files */
		serveFile(req, res);
	}
}

function serveFile(req, res) {
	var filePath = path.join(__dirname, req.url);
	console.log("File: %s", filePath);	

	fs.exists(filePath, function(exists) {
		if (!exists) {
			res.statusCode = 404;
			res.end("Ooops");
		} else {
			var readStream = fs.createReadStream(filePath);
			var body = "";
			var size = 0;
			readStream.on("data", function (chunk) {
				body += chunk;
		        size += chunk.length;
			});

			readStream.on("end", function(){
				console.log("Done reading: %s (%d bytes)", filePath, size);
				/* TODO: Only pass certain types through QoS */
				handleQos(res, body);
			});
		}
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
	var req = http.get("http://localhost:3031" + $target.attr("model"));
	req.on('error', function(err) {
		console.log('Error: ' + err.message);
		callback();
	});
	req.on('response', function(res) {
		console.log('Response');
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