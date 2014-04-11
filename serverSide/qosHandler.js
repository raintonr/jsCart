var qos = 100;
var http = require("http");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var request = require("request");
var async = require("async");

module.exports = {
	init : function(opts) {
		this.opts = opts;
	},
	handleQos : function(req, res, body) {
		/*
		 * Copy original request ID headers so user auth works.
		 */
		var reqOptions = {
				host: "localhost",
				port: this.opts.backendPort,
				method: "GET",
				headers: extractUserHeaders(this.opts.userHeaders, req)
		};

		var funcs = [];
		$ = cheerio.load(body);
		$(".qosTemplate").each(function() {
			funcs.push($(this));
		});
		
		async.each(funcs, function($item, callback) {
			replaceQos(reqOptions, $item, $, callback);
		}, function() {
			body = $.html();
			finishReq(res, body);
		});
	}
};

function extractUserHeaders(userHeaders, req) {
	var headers = {};
	for (var lp in userHeaders) {
		var header = userHeaders[lp];
		if (req.headers[header]) {
			headers[header] = req.headers[header]; 
		}
	}
	return headers;
}

function replaceQos(options, $target, $, callback) {
	options.path = $target.attr("model");
	
	var req = http.request(options);
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