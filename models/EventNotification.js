/**
 * Notification Schema
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationSchema = new Schema({
	eventId: Schema.Types.ObjectId,
	eventTitle: String,
	userEmail: String,
	notificationDate: Number
});


module.exports = mongoose.model('notification', NotificationSchema);