var http = require("http");
var path = require("path");
var fs = require("fs");

module.exports = {
	createServer : function(port) {
		console.log("Starting CMS on %d...", port);

		http.createServer(function(req, res) {
			if (req.method == "GET") {
				handle_get(req, res);
			}
		}).listen(port);

	}
};

function handle_get(req, res) {
	console.log("CMS serving up: ", req.url);
	var filePath = path.join(__dirname, req.url);
	console.log("File: %s", filePath);

	fs.exists(filePath, function(exists) {
		if (!exists) {
			res.statusCode = 404;
			res.end("Ooops");
		} else {
			var stat = fs.statSync(filePath);
			res.writeHead(200, {
				"Content-Length" : stat.size
			});

			var readStream = fs.createReadStream(filePath);
			readStream.pipe(res);
		}
	});
}