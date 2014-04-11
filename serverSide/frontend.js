var http = require("http");
var genericSession = require("generic-session");
var sessionStore = genericSession.MemoryStore();
var qosHandler = require("./qosHandler");
var opts = {};

module.exports = {
		createServer : function(optsIn) {
			opts = optsIn;
			
			qosHandler.init(opts);
			console.log("Starting on %d...", opts.frontendPort);

			http.createServer(function(req, res) {
				var session = genericSession(req, res, sessionStore);
				if (req.method == "POST") {
					handle_post(req, res, session);
				} else {
					handle_get(req, res, session);
				}
			}).listen(opts.frontendPort);
		}
};

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
	var req = http.get("http://localhost:" + opts.cmsPort + reqIn.url);
	req.on('response', function(res) {
		console.log('Response from CMS');
		var body = "";
		res.on('data', function(chunk){
			body += chunk;
		});
		res.on("end", function() {
			qosHandler.handleQos(resIn, body);
		});
	});
}
