var http = require("http");
var fs = require("fs");
var path = require("path");
var genericSession = require('generic-session');
var sessionStore = genericSession.MemoryStore();

var port = 3030;
console.log("Starting on %d...", port);

http.createServer(function(req, res) {
	var session = genericSession(req, res, sessionStore);
	if (req.method == "POST") {
		handle_post(req, res, session);
	} else {
		handle_get(req, res, session);
	}
}).listen(port);

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
		/* Nope - just serve up some files */
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
}