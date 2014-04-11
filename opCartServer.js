var serverSide = "./serverSide/";
var opts = {
	backendPort : 3031,
	frontendPort : 3030,
	cmsPort : 3032
};

/* Start the 'backend' server */

require(serverSide + "backend").createServer(opts);

/* Start the 'CMS' server */

require(serverSide + "CMS").createServer(opts);

/* Start our 'frontend' server */

require(serverSide + "frontend").createServer(opts);
