var http = require("http");
var opts = {};

module.exports = {
	init : function(optsIn) {
		opts = optsIn;
	},
	getReqOpts : function(reqIn, path) {
		return getReqOpts(reqIn, path);
	},
	post : function(reqIn, resIn) {
		/*
		 * Basically, proxy this through to the backend after injecting headers.
		 * TODO: handle Websockets, with fallback to this.
		 * TODO: Maybe there is a better way than this?
		 */
		var req = http.request(getReqOpts(reqIn, reqIn.url));
		reqIn.on("data", function(chunk) {
			req.write(chunk);
	    });
	    reqIn.on("end", function() {
	    	req.end();
			req.on('response', function(res) {
				console.log('Response from Backend');
				resIn.writeHead(res.statusCode, res.headers);
				req.on('data', function(chunk) {
					resIn.write(chunk);
				});
				res.on("end", function() {
					resIn.end();
				});
			});
			req.on('error', function(err) {
				console.log('Error from backend post (backend): ' + err.message);
				resIn.statusCode = 500;
				resIn.end;
			});
	    });
		reqIn.on('error', function(err) {
			console.log('Error from backend post request (in): ' + err.message);
			resIn.statusCode = 500;
			resIn.end;
		});
	},
	get : function(reqIn, resIn, path) {
		/*
		 * Copy original request ID headers so user auth works.
		 */
		var req = http.request(getReqOpts(reqIn, path));
		req.end();
		req.on('error', function(err) {
			console.log('Error from backend: ' + err.message);
			resIn.statusCode = 500;
			resIn.end;
		});
		req.on('response', function(res) {
			console.log('Response from Backend');
			var data = "";
			res.on('data', function(chunk) {
				data += chunk;
			});
			res.on("end", function() {
				resIn.writeHead(200, {
					"Content-Length" : data.length
				});
				resIn.write(data);
				resIn.end();
			});
		});
	}
};

function getReqOpts(req, path) {
	return {
			host: "localhost",
			port: opts.backendPort,
			path: path,
			method: req.method,
			headers: extractUserHeaders(req)
	};
}

function extractUserHeaders(req) {
	var headers = {};
	for (var lp in opts.userHeaders) {
		var header = opts.userHeaders[lp];
		if (req.headers[header]) {
			headers[header] = req.headers[header]; 
		}
	}
	return headers;
}
