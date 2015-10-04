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
		}else{
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
			id : data
		};
	}
	if (operation === "put" || operation === "delete") {
		result = {
			success : 1
		};
	}
	if (operation === "get") {
		var resList = [];

		result = {
			"success" : 1,
			"result" : data
		};
	}
	return res.json(result);

};

/*
 * create events.
 */

exports.create = function(req, res) {
	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, function(err, user) {
		if (err) {
			return buildJSON(err, res, "create", null);
		}
		if (user === null) {
			return buildJSON("Bad Credential", res, "create", null);
		}

		var event = {
			title : req.body.name,
			description : req.body.desc,
			startDate : req.body.sDate,
			endDate : req.body.eDate,
			location : req.body.location,
			eventClass: req.body.eventClass,
			notify : req.body.notify,
			notificationDate : req.body.nDate
		};

		user.events.push(event);
		user.save(function(err, returnedData) {
			if (err) {
				console.log("saving event error => " + err);
			}
			return buildJSON(err, res, "create",
					returnedData.events[returnedData.events.length - 1].id);
		});
	});

};

/**
 * update Event
 */

exports.update = function(req, res) {

	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, 'events', function(err, user) {
		if (err) {
			return buildJSON(err, res, "create", null);
		}
		if (user === null){
			return buildJSON("Bad Credential", res, "put", null);
		}
		var event = user.events.id(req.params.eventId);
		if (event === null){
			return buildJSON("Invalid Event ID", res, "put", null);
		}
		User.update({
			'events._id' : req.params.eventId
		}, {
			'$set' : {
				'events.$.title' : req.body.name,
				'events.$.description' : req.body.desc,
				'events.$.startDate' : req.body.sDate,
				'events.$.endDate' : req.body.eDate,
				'events.$.location' : req.body.location,
				'events.$.eventClass' : req.body.eventClass,
				'events.$.notify' : req.body.notify,
				'events.$.notificationDate' : req.body.nDate
			}
		}, function(err, model) {
			return buildJSON(err, res, "put", model);
		});
	});

};

/**
 * Delete an event
 * 
 */

exports.del = function(req, res) {

	var User = require('../models/User');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, function(err, user) {
		if (err) {
			return buildJSON(err, res, "delete", null);
		}
		if (user === null) {
			return buildJSON("Bad Credential", res, "delete", null);
		}
		User.findByIdAndUpdate(user._id, {
			$pull : {
				'events' : {
					_id : req.params.eventId
				}
			}
		}, function(err, model) {
			return buildJSON(err, res, "delete", null);
		});
	});

};

/**
 * 
 * Get event params: eventId, email, password
 * 
 */

exports.getEvent = function(req, res) {

	var User = require('../models/User');
	User.findOne({
		'email' : req.params.email,
		'password' : req.params.password
	}, 'events', function(err, user) {
		if (err) {
			
			return buildJSON(err, res, "get", null);
		}
		if (user === null) {
			return buildJSON("Bad Credential", res, "get", null);
		}
		var event = user.events.id(req.params.eventId);
		if (event === null){
			return buildJSON("Invalid Event ID", res, "get", null);
		}
		return buildJSON(err, res, "get", event);
	});
};

/**
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

/**
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
