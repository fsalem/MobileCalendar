var User = require('../models/User');
/**
 * function for building response object
 */

var buildJSON = function(err, res, operation, data) {
	var result = [];
	if (err) {
		if (typeof err.message !== 'undefined') {
			result = {
				success : 0,
				error : err.message
			};
		} else {
			result = {
				success : 0,
				error : err
			};
		}
		return res.json(result);

	}
	if (operation === "create") {
		result = {
			success : 1,
			result : data
		};
	}

	if (operation === "login") {
		if (data) {
			result = {
				success : 1
			};
		} else {
			result = {
				success : 0
			};
		}
	}
	return res.json(result);

};

/**
 * 
 */
/**
 * register users.
 */

exports.create = function(req, res) {
	User.findOne({
		'email' : req.body.email,
	}, 'email', function(err, user) {
		if (err) {
			return buildJSON(err, res, "create", null);
		}
		if (!user) {
			console.log("creating a user");
			var newUser = new User();
			newUser.email = req.body.email;
			newUser.password = req.body.password;
			newUser.save(function(err) {
				if (err) {
					return buildJSON(err, res, "create", null);
				}
				return buildJSON(null, res, "create",
						"User creation succeeded!");
			});
		}
		if (user) {
			return buildJSON("User is already exist", res, "create", null);
		}
	});

};

/**
 * Login user.
 */

exports.login = function(req, res) {
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, function(err, user) {
		if (err) {
			return buildJSON(err, res, "login", null);
		}
		if (!user) {
			return buildJSON("Bad Credential", res, "login", null);
		}
		if (user) {
			return buildJSON(null, res, "create", "Success");
		}
	});

};
