/**
 * Module dependencies.
 */

var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var event = require('./routes/event');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('params.properties');
var connectionURL = properties.get('monogoDB.connection.url');
var runningPort = properties.get('application.port');
var app = express();

// all environments
app.set('port', process.env.PORT || runningPort);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());
mongoose.connect(connectionURL);
// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/api/events', event.create);
app.put('/api/events/:eventId', event.update);
app.del('/api/events/:eventId', event.del);
app.get('/api/events/:email/:password', event.getAllEvents);
app.get('/api/events/:eventId/:email/:password', event.getEvent);
app.get('/api/events/search/period/:startDate/:endDate/:email/:password',
		event.getSpecificEvents);
app.get('/api/events/search/location/:location/:email/:password',
		event.searchByLocation);
app.get('/api/events/search/class/:eventClass/:email/:password',
		event.searchByClass);
app.get('/api/events/search/text/:text/:email/:password', event.searchByText);

app.post('/api/users', user.create);
app.post('/api/users/login', user.login);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
