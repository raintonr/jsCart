var http = require("http");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var request = require("request");
var async = require("async");
var backendClient = require("./backendClient");
var opts;

module.exports = {
	init : function(optsIn) {
		opts = optsIn;
		backendClient.init(opts);
	},
	handleQos : function(req, res, body) {
		var funcs = [];
		$ = cheerio.load(body);
		$(".qosTemplate").each(function() {
			funcs.push($(this));
		});
		
		async.each(funcs, function($item, callback) {
			replaceQos(req, $item, $, callback);
		}, function() {
			body = $.html();
			res.writeHead(200, {
				"Content-Length" : body.length
			});
			res.write(body);
			res.end();
		});
	}
};

function replaceQos(reqIn, $target, $, callback) {
	var path = $target.attr("model");
	var req = http.request(backendClient.getReqOpts(reqIn, path));
	req.end();
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
			if (res.statusCode == 403) {
				/*
				 * Remove the target and associated template as user has no
				 * access to this
				 */
				console.log("Access Denied returned from backend.");
				$("#" + $target.attr("template")).remove();
				$target.remove();
			} else {
				/* Process template with the returned model */
				console.log("Read from server: " + data);
				var source = $("#" + $target.attr("template")).html();
				console.log("Compiling template: " + source);
				template = Handlebars.compile(source);
				model = JSON.parse(data);
				$target.html(template(model));
				$target.attr("qosDone", "1");
			};
			callback();
		});
	});
	req.setTimeout(opts.qos, function() {
		console.log("Timeout!");
		req.abort();
	});
}