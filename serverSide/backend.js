var http = require("http");

module.exports = {
	createServer : function(opts) {
		console.log("Starting Backend on %d...", opts.backendPort);

		http.createServer(function(req, res) {
			if (req.method == "GET") {
				handle_get(req, res);
			}
		}).listen(opts.backendPort);

	}
};

function handle_get(req, res) {
	res.writeHead(200, {
		"Access-Control-Allow-Origin": "*"
	});
	console.log("Backend serving up: ", req.url);
	if (req.url == "/slow") {
		setTimeout(function() {
			res.end(JSON.stringify({
				"operation" : "slow"
			}));
		}, 5000);
	} else {
		res.end(JSON.stringify({
			"operation" : "fast"
		}));
	}
}