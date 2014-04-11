var manacle = require("manacle");

function User(req) {
	console.log("Initialilsing user");
	/*
	 * We're using manacle for simple ACL management.
	 */
	this.userAcl = manacle.create();

	/*
	 * TODO: dig out user info from header. For now just allow the slow
	 * operation.
	 * 
	 * If there were any complex operations going on here, we would stash the
	 * results in the session.
	 */
	this.userAcl.allow("read", "/slow");
}

User.prototype.allowed = function(path) {
	return this.userAcl.allowed("read", path);
};

module.exports = User;
