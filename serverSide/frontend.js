var http = require("http");
var genericSession = require("generic-session");
var qosHandler = require("./qosHandler");
var backendClient = require("./backendClient");
var opts = {};

module.exports = {
		createServer : function(optsIn) {
			opts = optsIn;
			
			qosHandler.init(opts);
			backendClient.init(opts);
			console.log("Starting on %d...", opts.frontendPort);

			http.createServer(function(req, res) {
				var session = genericSession(req, res, opts.sessionStore);
				req.headers._sessionid = session.id;
				if (req.method == "POST") {
					backendClient.post(req, res);
				} else {
					handle_get(req, res);
				}
			}).listen(opts.frontendPort);
		}
};

function handle_get(req, res) {
	if (req.url.indexOf("/models/") == 0) {
		/* Pull models from backend */
		console.log("Passing model request to backend");
		backendClient.get(req, res, req.url);
	} else {
		/* Nope - just serve up some files from the CMS */
		serveFromCms(req, res);
	}
}

function serveFromCms(reqIn, resIn) {
	var req = http.get("http://localhost:" + opts.cmsPort + reqIn.url);
	req.on('error', function(err) {
		console.log('Error from CMS: ' + err.message);
		resIn.statusCode = 500;
		resIn.end;
	});
	req.on('response', function(res) {
		console.log('Response from CMS');
		/*
		 * We have to assemble the whole body first in order to parse the HTML in QOS handler.
		 */
		var body = "";
		res.on('data', function(chunk){
			body += chunk;
		});
		res.on("end", function() {
			qosHandler.handleQos(reqIn, resIn, body);
		});
	});
}