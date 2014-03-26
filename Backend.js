var http = require("http");

module.exports = {
	createServer : function() {
		var port = 3031;
		console.log("Starting on %d...", port);

		http.createServer(function(req, res) {
			if (req.method == "GET") {
				handle_get(req, res);
			}
		}).listen(port);

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