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
					handle_post(req, res, session);
				} else {
					handle_get(req, res);
				}
			}).listen(opts.frontendPort);
		}
};

function handle_post(req, res, session) {
	/*
	 * TODO: pass this to the backend.
	 */
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
	if (req.url.indexOf("/models/") == 0) {
		console.log("Passing model request downstream");
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
		var body = "";
		res.on('data', function(chunk){
			body += chunk;
		});
		res.on("end", function() {
			qosHandler.handleQos(reqIn, resIn, body);
		});
	});
}