
/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , routes = require('./routes')
  , event = require('./routes/event')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose   = require('mongoose');
 
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://calendar:calendar@ds031763.mongolab.com:31763/scalable_calendar');
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/api/events',event.create);
app.put('/api/events/:eventId',event.update);
app.del('/api/events/:eventId',event.del);
app.post('/api/users',user.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
