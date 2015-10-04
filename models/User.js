/**
 * User Schema
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema = new Schema({
	title: String,
	description: String,
	start: Date,
	end: Date,
	location: String,
	eventClass: String,
	notify: Boolean,
	notificationDate: {type: Date, default: null},
	creationDate: {type: Date, default: Date.now}
});

var UserSchema   = new Schema({
	email: String,
	password: String, // needs encryption technique
	creationDate: {type: Date, default: Date.now},
	events: [EventSchema]
});

module.exports = mongoose.model('User', UserSchema);