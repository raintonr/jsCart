var qos = 100;
var http = require("http");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var request = require("request");
var async = require("async");
var opts = {};

module.exports = {
	init : function(optsIn) {
		opts = optsIn;
	},
	getReqOpts : function(reqIn, path) {
		return getReqOpts(reqIn, path);
	},
	get : function(reqIn, resIn, path) {
		/*
		 * Copy original request ID headers so user auth works.
		 */
		var req = http.request(getReqOpts(reqIn, path));
		req.end();
		req.on('error', function(err) {
			console.log('Error from backend: ' + err.message);
			resIn.statusCode = 500;
			resIn.end;
		});
		req.on('response', function(res) {
			console.log('Response from Backend');
			var data = "";
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
				resIn.writeHead(200, {
					"Content-Length" : data.length
				});
				resIn.write(data);
				resIn.end();
			});
		});
	}
};

function getReqOpts(req, path) {
	return {
			host: "localhost",
			port: opts.backendPort,
			path: path,
			method: "GET",
			headers: extractUserHeaders(req)
	};
}

function extractUserHeaders(req) {
	var headers = {};
	for (var lp in opts.userHeaders) {
		var header = opts.userHeaders[lp];
		if (req.headers[header]) {
			headers[header] = req.headers[header]; 
		}
	}
	return headers;
}
