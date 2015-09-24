/*
 * users.
 */

exports.create = function(req, res) {
	var User = require('../models/User');
	User.findOne({
		'email' : req.body.email,
	}, 'email', function(err, user) {
		if (err) {
			console.log("Error while searching for the user "+ err);
			return res.send(err);
		}
		if (!user) {
			console.log("creating a user");
			var newUser = new User();
			newUser.email = req.body.email;
			newUser.password = req.body.password;
			newUser.save(function(err) {
				if (err) {
					console.log("Error while saving -> "+err);
					return res.send(err);
				}
				return res.json({
					message : ' User registered!'
				});
			});
		}
		if (user) {
			return res.json({
				message : ' Already Exist'
			});
		}
	});

};