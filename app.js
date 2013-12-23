
/**
 * Module dependencies.
 */

var mongoose = require ("mongoose");
var express = require('express');
var routes = require('./routes');
// var user = require('./routes/user');
// var ItItem = require('./routes/ititem');
var http = require('http');
var path = require('path');
var jade = require('jade');

var app = express();
// var MongoStore = require('connect-mongo')(express); 
var settings = require('./settings'); 

app.configure(function(){ 
	mongoose.connect('mongodb://linserv1.cims.nyu.edu:26941/treeholedb');
	app.set('views', __dirname + '/views'); 
	app.set('view engine', 'jade'); 
	app.set('port', process.env.PORT || 3000);
	app.use(express.bodyParser());
	app.use(express.logger('dev'));
	app.use(express.urlencoded());
	app.use(express.methodOverride()); 
	app.use(express.cookieParser()); 
	// app.use(express.session({ 
	//     secret: settings.cookieSecret, 
	//     store: new MongoStore({ 
	//       db: settings.db 
	//     }) 
 //  	})); 
	app.use(app.router);
	routes(app); 
	app.use(express.static(__dirname + '/public')); 
}); 

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
