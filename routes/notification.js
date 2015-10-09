/**
 * RetrieveAll Before
 */

exports.retrieveAllBefore = function(time,callback) {
	
	var notificationModel = require('../models/EventNotification');
	notificationModel.find({
		'notificationDate' : {
			$lte : time
		}
	}, function(err, notifications) {
		return callback(notifications);
	});
};

/**
 * delete set of notifications
 */
exports.deleteRows = function(ids) {
	var notificationModel = require('../models/EventNotification');
	notificationModel.findOneAndRemove({
		'_id' : {
			$in : ids
		},
	}, function(err) {
		if (err) {
			console.log("Error while deleteing EventNotification " + ids);
		}
	});
};

/**
 * delete Event notification
 */
exports.deleteEventNotification = function(eventOId) {
	var notificationModel = require('../models/EventNotification');
	notificationModel.findOneAndRemove({
		'eventId' : eventOId,
	},
			function(err) {
				if (err) {
					console.log("Error while deleting a EventNotification "+ eventOId);
				}
			});
};

/**
 * add notification
 */
exports.addNotification = function(eventOId, title, email, nDate) {
	var NotificationModel = require('../models/EventNotification');
	var notification = new NotificationModel();
	notification.eventId = eventOId;
	notification.eventTitle = title;
	notification.userEmail = email;
	notification.notificationDate = nDate;
	notification.save(function(err) {
		if (err) {
			console.log("Error while creating new EventNotification");
		}
	});
};

/**
 * update notification
 */
exports.updateNotification = function(eventOId, title, nDate,callback) {
	var NotificationModel = require('../models/EventNotification');
	NotificationModel.update({
		eventId : eventOId
	}, {
		$set : {
			eventTitle : title,
			notificationDate : nDate
		}
	}, function(err) {
		if (err) {
			console.log("Error while updating a EventNotification");
			return callback(false);
		}
		return callback(true);
	});
};
