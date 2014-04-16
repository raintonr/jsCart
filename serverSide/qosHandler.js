var fs = require("fs");
var path = require("path");
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
		$ = cheerio.load(body);
		handleQos(req, $, $, function(){
			body = $.html();
			res.writeHead(200, {
				"Content-Length" : body.length
			});
			res.write(body);
			res.end();
		});
	}
};

function handleQos(req, $root, $, callbackOut) {
	var funcs = [];
	$(".qosTemplate").each(function() {
		funcs.push($(this));
	});
	
	async.each(funcs, function($item, callback) {
		replaceQos(req, $item, $root, $, callback);
	}, callbackOut);
}

function replaceQos(reqIn, $target, $root, $, callback) {
	var modelPath = $target.attr("model");
	var templateName = $target.attr("template");
	
	/*
	 * TODO: cache template loads.
	 */
	var filePath = path.join(__dirname, "/templates/") + templateName + ".html";
	console.log("Loading template: %s", filePath);
	fs.readFile(filePath, function(err, data) {
		if (err) {
			/* Fail gracefully */
			console.log(err);
			callback();
		} else {
			var templateSource = data.toString();
			var req = http.request(backendClient.getReqOpts(reqIn, modelPath));
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
						callback();
					} else {
						/* Process template with the returned model */
						model = JSON.parse(data);
						console.log("Read from server: " + data);
						console.log("Compiling template: " +  templateSource);
						template = Handlebars.compile(templateSource);
						
						body = template(model);
						$ = cheerio.load(body);
						handleQos(reqIn, $root, $, function(){
							$target.attr("qosDone", "1");
							$target.html($.html());
							callback();
						});
					};
				});
			});
			req.setTimeout(opts.qos, function() {
				req.abort();
				console.log("Timeout!");
				/* 
				 * We need to add the template in here for the front end.
				 * Only if it isn't there already of course.
				 */
				if (!$root("#" + templateName).length) {
					var templateCode =
						'<script id="' + templateName + '" type="text/x-handlebars-template">' +
						templateSource +
						'</script>';
					$root("body").append(templateCode);
				}
			});
		}
	});
}