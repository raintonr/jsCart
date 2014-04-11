var http = require("http");
var path = require("path");
var fs = require("fs");

module.exports = {
	createServer : function(opts) {
		console.log("Starting CMS on %d...", opts.cmsPort);

		http.createServer(function(req, res) {
			if (req.method == "GET") {
				handle_get(req, res);
			}
		}).listen(opts.cmsPort);

	}
};

function handle_get(req, res) {
	console.log("CMS serving up: ", req.url);
	var filePath = path.join(__dirname + "/../clientSide", req.url);
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