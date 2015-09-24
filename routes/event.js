/*
 * events.
 */

exports.create = function(req, res) {
	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, 'events', function(err, user) {
		if (err) {
			console.log("getting user error => " + err);
			return res.send(err);
		}

		var event = {
			name : req.body.name,
			description : req.body.desc,
			startDate : req.body.sDate,
			endDate : req.body.eDate,
			location : req.body.location,
			notify : req.body.notify,
			notificationDate : req.body.nDate
		};

		user.events.push(event);
		user.save(function(err) {
			if (err) {
				console.log("saving user error => " + err);
				return res.send(err);
			}
			res.json({
				message : req.body.name + ' created!'
			});
		});
	});

};

/**
 * Event update code
 */

exports.update = function(req, res) {

	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password,
		'events._id' : req.params.eventId
	}, 'events', function(err, user) {
		if (err) {
			console.log("getting user error => " + err);
			return res.send(err);
		}
		User.update({
			'events._id' : req.params.eventId
		}, {
			'$set' : {
				'events.$.name' : req.body.name,
				'events.$.description' : req.body.desc,
				'events.$.startDate' : req.body.sDate,
				'events.$.endDate' : req.body.eDate,
				'events.$.location' : req.body.location,
				'events.$.notify' : req.body.notify,
				'events.$.notificationDate' : req.body.nDate
			}
		}, function(err, model) {
			if (err) {
				console.log("updateing user error => " + err);
				return res.send(err);
			}
			res.json(model);
		});
	});

};



/*
 * Delete an event
 * 
 */

exports.del = function(req, res) {

	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password,
		'events._id' : req.params.eventId
	}, 'events', function(err, user) {
		if (err) {
			console.log("getting user error => " + err);
			return res.send(err);
		}
		User.findByIdAndUpdate(user._id, { $pull: { 'events': {  _id: req.params.eventId } } }, function(err, model) {
			if (err) {
				console.log("deleting event error => " + err);
				return res.send(err);
			}
			return res.json(model);
		});
	});

};
