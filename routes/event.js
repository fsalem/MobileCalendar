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
	var Notification = require('./notification');
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
		var startDate = Number(req.body.sDate);
		var endDate = Number(req.body.eDate);
		var notificationDate = null;

		if (req.body.nDate !== null && req.body.nDate !== "null") {
			notificationDate = Number(req.body.nDate);
		}

		var event = {
			title : req.body.name,
			description : req.body.desc,
			start : startDate,
			end : endDate,
			location : req.body.location,
			eventClass : req.body.eventClass,
			notify : req.body.notify,
			notificationDate : notificationDate,
			creationDate : Date.now()
		};

		user.events.push(event);
		user.save(function(err, returnedData) {
			if (err) {
				console.log("saving event error => " + err);
			}
			if (notificationDate !== null) {
				Notification.addNotification(returnedData, req.body.name,
						user.email, notificationDate);
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
	var Notification = require('./notification');
	// var Events = require('../models/Event');
	User.findOne({
		'email' : req.body.email,
		'password' : req.body.password
	}, 'events', function(err, user) {
		if (err) {
			return buildJSON(err, res, "create", null);
		}
		if (user === null) {
			return buildJSON("Bad Credential", res, "put", null);
		}
		var event = user.events.id(req.params.eventId);
		if (event === null) {
			return buildJSON("Invalid Event ID", res, "put", null);
		}
		var startDate = Number(req.body.sDate);
		var endDate = Number(req.body.eDate);
		var notificationDate = null;
		if (req.body.nDate !== null && req.body.nDate !== "null") {
			notificationDate = Number(req.body.nDate);
		}
		User.update({
			'events._id' : req.params.eventId
		}, {
			'$set' : {
				'events.$.title' : req.body.name,
				'events.$.description' : req.body.desc,
				'events.$.start' : startDate,
				'events.$.end' : endDate,
				'events.$.location' : req.body.location,
				'events.$.eventClass' : req.body.eventClass,
				'events.$.notify' : req.body.notify,
				'events.$.notificationDate' : notificationDate
			}
		}, function(err, model) {
			if (!err && notificationDate !== null) {
				var updateNRes = Notification.updateNotification(
						req.params.eventId, req.body.name, notificationDate,
						function(updateNRes) {
							if (!updateNRes) {
								Notification.addNotification(
										req.params.eventId, req.body.name,
										user.email, notificationDate);
							}
						});
			}
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
	var Notification = require('./notification');
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
			if (!err) {
				Notification.deleteEventNotification(req.params.eventId);
			}
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
		if (event === null) {
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
			return buildJSON(err, res, "get", null);
		}
		if (user === null) {
			return buildJSON("Bad Credential", res, "get", null);
		}
		return buildJSON(err, res, "get", user.events);
	});
};

/**
 * 
 * Search period events params: email, password, startDate, endDate
 * 
 */

exports.getSpecificEvents = function(req, res) {

	var User = require('../models/User');

	var startDate = Number(req.params.startDate);
	var endDate = Number(req.params.endDate);

	User.aggregate({
		$match : {
			'email' : req.params.email,
			'password' : req.params.password,
			'events.start' : {
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
			'events.start' : {
				$gte : startDate,
				$lte : endDate
			}
		}
	}, function(err, events) {
		if (err) {
			return buildJSON(err, res, "get", null);
		}
		return buildJSON(err, res, "get", events);
	});
};

/**
 * =============================================================================================
 * Search
 */
/**
 * 
 * Search events by location params: email, password, location
 * 
 */

exports.searchByLocation = function(req, res) {

	var User = require('../models/User');
	
	User.aggregate({
		$match : {
			'email' : req.params.email,
			'password' : req.params.password,
			'events.location' : req.params.location
		}
	}, {
		$project : {
			events : true
		}
	}, {
		$unwind : '$events'
	}, {
		$match : {
			'events.location' : req.params.location
		}
	}, function(err, events) {
		if (err) {
			return buildJSON(err, res, "get", null);
		}
		return buildJSON(err, res, "get", events);
	});
};

/**
 * 
 * Search events by class params: email, password, class
 * 
 */

exports.searchByClass = function(req, res) {

	var User = require('../models/User');

	User.aggregate({
		$match : {
			'email' : req.params.email,
			'password' : req.params.password,
			'events.eventClass' : req.params.eventClass
		}
	}, {
		$project : {
			events : true
		}
	}, {
		$unwind : '$events'
	}, {
		$match : {
			'events.eventClass' : req.params.eventClass
		}
	}, function(err, events) {
		if (err) {
			return buildJSON(err, res, "get", null);
		}
		return buildJSON(err, res, "get", events);
	});
};


/**
 * 
 * Search events by Text params: email, password, text
 * 
 */

exports.searchByText = function(req, res) {

	var User = require('../models/User');
	
	User.aggregate({
		$match : {
			'email' : req.params.email,
			'password' : req.params.password,
			$or :[{'events.title': new RegExp('^'+req.params.text+'$', "i")},{'events.description':new RegExp('^'+req.params.text+'$', "i")}]
		}
	}, {
		$project : {
			events : true
		}
	}, {
		$unwind : '$events'
	}, {
		$match : {
			$or :[{'events.title': new RegExp('^'+req.params.text+'$', "i")},{'events.description':new RegExp('^'+req.params.text+'$', "i")}]
		}
	}, function(err, events) {
		if (err) {
			return buildJSON(err, res, "get", null);
		}
		return buildJSON(err, res, "get", events);
	});
};