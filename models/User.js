/**
 * User Schema
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var EventSchema = new Schema({
	name: String,
	description: String,
	startDate: Date,
	endDate: Date,
	location: String,
	notify: Boolean,
	notificationDate: {type: Date, default: null},
	creationDate: {type: Date, default: Date.now},
	deactivated: {type: Boolean,default: false}
});

var UserSchema   = new Schema({
	email: String,
	password: String, // needs encryption technique
	creationDate: {type: Date, default: Date.now},
	events: [EventSchema]
});

module.exports = mongoose.model('User', UserSchema);