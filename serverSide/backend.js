var genericSession = require("generic-session");
var http = require("http");
var User = require("./User");
var opts = {};

module.exports = {
	createServer : function(optsIn) {
		opts = optsIn;
		console.log("Starting Backend on %d...", opts.backendPort);

		http.createServer(function(req, res) {
			if (req.method == "GET") {
				handle_get(req, res);
			}
		}).listen(opts.backendPort);

	}
};

function handle_get(req, res) {
	/*
	 * Create a new session then overwrite it's ID from that in the header. 
	 */
	var session = genericSession(req, res, opts.sessionStore);
	session.id = req.headers._sessionid;
	console.log("sessionId: ", session.id);
	
	var user = new User(req);
	if (!user.allowed(req.url)) {
		console.log("Access Denied: ", req.url);
		finishRes(res, 403);
	} else {
		console.log("Backend serving up: ", req.url);
		
		/*
		 * TODO: these should be served up from the appropriate modules.
		 */
		
		switch (req.url) {
		case "/models/slow":
			setTimeout(function() {
				finishRes(res, 200, JSON.stringify({
					"operation" : "slow"
				}));
			}, 5000);
			break;

		case "/models/fast":
			finishRes(res, 200, JSON.stringify({
				"operation" : "fast"
			}));
			break;
			
		case "/models/cart":
			session.get("cart", function(err, data){
				finishRes(res, 200, data);
			});
			break;

		default:
			finishRes(res, 404);
			break;
			
		}
	}
}

function finishRes(res, status, body) {
	res.statusCode = status;
	if (status == 200) {
		if (!body || body.length == 0) {
			body = "{}";
		}
		res.setHeader("Content-Length", body.length);
		res.write(body);
	}
	res.end();
}