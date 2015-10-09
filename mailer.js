/**
 * Original code from Shaikh Sahid 
 * File Name : Mailer.js
 */

/**
 * Load all the required modules
 */

var async = require("async");
var http = require("http");
var nodemailer = require("nodemailer");
var notificationService = require('./routes/notification');
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('params.properties');
var connectionURL = properties.get('monogoDB.connection.url');
var senderEmail = properties.get('email.email');
var senderPassword = properties.get('email.password');
var mongoose = require('mongoose');
mongoose
		.connect(connectionURL);

var transporter;

/* Loading modules done. */

function massMailer() {
	console.log("in massMailer");
	var self = this;
	transporter = nodemailer.createTransport({
		service : "Gmail",
		auth : {
			user : senderEmail,
			pass : senderPassword
		}
	});
	// Fetch all the emails from database and push it in listofemails
	// Will do it later.
	self.invokeOperation();
}

/* Invoking email sending operation at once */

massMailer.prototype.invokeOperation = function() {
	var self = this;
	notificationService.retrieveAllBefore(Date.now(), function(
			eventNotifications) {
		if (eventNotifications !== null) {
			console.log("Length is "+eventNotifications.length);
			eventNotifications.forEach(function(notification) {
				self.SendEmail(notification.eventId,notification.userEmail, notification.eventTitle,
						function() {
							console.log("in callback");
						});
			});
		}
	});
};

/*
 * This function will be called by multiple instance. Each instance will contain
 * one email ID After successfull email operation, it will be pushed in failed
 * or success array.
 */

massMailer.prototype.SendEmail = function(eventId,Email, Title, callback) {
	console.log("Sending email to " + Email);
	var self = this;
	self.status = false;
	// waterfall will go one after another
	// So first email will be sent
	// Callback will jump us to next function
	// in that we will update DB
	// Once done that instance is done.
	// Once every instance is done final callback will be called.
	async.waterfall([ function(callback) {
		var mailOptions = {
			from : senderEmail,
			to : Email,
			subject : 'Koko Calendar: Event Notification',
			text : "Hello<br/>, you need to pay attention with your event " + Title
		};
		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				console.log(error);
				// failure_email.push(Email);
			} else {
				self.status = true;
				// success_email.push(Email);
			}
			callback(null, self.status, Email);
		});
	}, function(statusCode, Email, callback) {
		if (statusCode){
			notificationService.deleteEventNotification(eventId);
		}
		console.log("Will update DB here for " + Email + " With " + statusCode);
		callback();
	} ], function() {
		// When everything is done return back to caller.
		callback();
	});
};

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
	console.log("new massMailer will be created!");
	new massMailer(); // lets begin
}, the_interval);
