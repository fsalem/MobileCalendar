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
			return res.json({
				message : 'error -> ' + err
			});
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
				return res.json({
					message : 'error -> ' + err
				});
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
			return res.json({
				message : 'error -> ' + err
			});
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
				return res.json({
					message : 'error -> ' + err
				});
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
			return res.json({
				message : 'error -> ' + err
			});
		}
		User.findByIdAndUpdate(user._id, {
			$pull : {
				'events' : {
					_id : req.params.eventId
				}
			}
		}, function(err, model) {
			if (err) {
				console.log("deleting event error => " + err);
				return res.json({
					message : 'error -> ' + err
				});
			}
			return res.json(model);
		});
	});

};

/*
 * 
 * Get event params: eventId, email, password
 * 
 */

exports.getEvent = function(req, res) {

	var User = require('../models/User');
	User.findOne({
		'email' : req.params.email,
		'password' : req.params.password,
		'events._id' : req.params.eventId
	}, 'events', function(err, user) {
		if (err) {
			console.log("getting user error => " + err);
			return res.json({
				message : 'error -> ' + err
			});
		}
		if (!user) {
			console.log("no user exist ");
			return res.json({
				message : 'Invalid user'
			});
		}
		var event = user.events.id(req.params.eventId);
		return res.json(event);
	});
};

/*
 * 
 * Get All events params: email, password
 * 
 */

exports.getAllEvents = function(req, res) {

	var User = require('../models/User');
	User.findOne({
		'email' : req.params.email,
		'password' : req.params.password
	}, 'events', function(err, user) {
		if (err) {
			console.log("getting user error => " + err);
			return res.json({
				message : 'error -> ' + err
			});
		}
		if (!user) {
			console.log("no user exist ");
			return res.json({
				message : 'Invalid user'
			});
		}
		return res.json(user.events);
	});
};

/*
 * 
 * Get period events params: email, password, startDate, endDate
 * 
 */

exports.getSpecificEvents = function(req, res) {

	var User = require('../models/User');

	var startDate = new Date(req.params.startDate);
	var endDate = new Date(req.params.endDate);

	User.aggregate({
		$match : {
			'email' : req.params.email,
			'password' : req.params.password,
			'events.startDate' : {
				$gte : startDate,
				$lte : endDate
			}
		}
	}, {
		$project : {
			events : true
		}
	}, {
		$unwind : '$events'
	}, {
		$match : {
			'events.startDate' : {
				$gte : startDate,
				$lte : endDate
			}
		}
	}, function(err, events) {
		if (err) {
			console.log("getting events error => " + err);
			return res.json({
				message : 'error -> ' + err
			});
		}
		if (!events) {
			console.log("no events exist ");
			return res.json({
				message : 'Invalid user'
			});
		}
		return res.json(events);
	});
};