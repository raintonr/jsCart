var manacle = require("manacle");

function User(req) {
	console.log("Initialilsing user");
	/*
	 * We're using manacle for simple ACL management.
	 */
	this.userAcl = manacle.create();

	/*
	 * TODO: dig out user info from header. For now just allow the slow
	 * operation for anonymous, fast for any user (look at 'cn' header).
	 * 
	 * If there were any complex operations going on here, we would stash the
	 * results in the session.
	 */
	this.userAcl.allow("GET", "/models/cart");
	this.userAcl.allow("POST", "/models/cart");
	this.userAcl.allow("GET", "/models/slow");

	if (req.headers["cn"]) {
		this.userAcl.allow("GET", "/models/fast");
	}
}

User.prototype.allowed = function(req) {
	return this.userAcl.allowed(req.method, req.url);
};

module.exports = User;
