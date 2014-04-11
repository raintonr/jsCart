var qos = 100;
var http = require("http");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var request = require("request");
var async = require("async");
var backendPort;

module.exports = {
	init : function(opts) {
		backendPort = opts.backendPort;
	},
	handleQos : function(res, body) {
		var funcs = [];

		$ = cheerio.load(body);
		$(".qosTemplate").each(function() {
			funcs.push($(this));
		});

		async.each(funcs, function(item, callback) {
			replaceQos(item, $, callback);
		}, function() {
			body = $.html();
			finishReq(res, body);
		});
	}
};

function replaceQos($target, $, callback) {
	var req = http.get("http://localhost:" + backendPort
			+ $target.attr("model"));
	req.on('error', function(err) {
		console.log('Error: ' + err.message);
		callback();
	});
	req.on('response', function(res) {
		console.log('Response from Backend');
		var data = "";
		res.on('data', function(chunk) {
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
	req.setTimeout(qos, function() {
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
