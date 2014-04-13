var serverSide = "./serverSide/";

/*
 * Normally we would use memcache, etc. for session store, but just to test, use
 * this generic store.
 * 
 * Because of that, declare it here and place in opts so we can share this
 * object between servers.
 */
var sessionStore = require("generic-session").MemoryStore();
var opts = {
	backendPort : 3031,
	frontendPort : 3030,
	cmsPort : 3032,
	userHeaders : [ "cn", "status", "_sessionid" ],
	sessionStore : sessionStore
};

/* Start the 'backend' server */

require(serverSide + "backend").createServer(opts);

/* Start the 'CMS' server */

require(serverSide + "CMS").createServer(opts);

/* Start our 'frontend' server */

require(serverSide + "frontend").createServer(opts);
