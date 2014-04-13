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
			passThru(reqIn, resIn, req);
	    });
		reqIn.on('error', function(err) {
			console.log('Error from backend POST request (in): ' + err.message);
			resIn.statusCode = 500;
			resIn.end;
		});
	},
	get : function(reqIn, resIn, path) {
		var req = http.request(getReqOpts(reqIn, path));
		passThru(reqIn, resIn, req);
	}
};

function passThru(reqIn, resIn, req) {
	req.end();
	req.on('response', function(res) {
		console.log('Response from backend for: ', reqIn.url, res.headers);
		/*
		 * Remove cookies from backend.
		 * TODO: find a better way to do this. Probably won't be needed when
		 * we are using memcache, etc. for sessions.
		 */
		delete res.headers["set-cookie"];

		resIn.writeHead(res.statusCode, res.headers);
		res.on('data', function(chunk) {
			resIn.write(chunk);
		});
		res.on("end", function() {
			resIn.end();
		});
	});
	req.on('error', function(err) {
		console.log('Error from backend POST (backend): ' + err.message);
		resIn.statusCode = 500;
		resIn.end;
	});
}

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
