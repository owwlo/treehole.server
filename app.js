var mongoose = require ("mongoose");
var express = require('express');
var routes = require('./routes');
// var user = require('./routes/user');
// var ItItem = require('./routes/ititem');
var util = require('util');
var http = require('http');
var path = require('path');
var jade = require('jade');
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var GoogleUser = require('./models/googleuser');

var app = express();
// var MongoStore = require('connect-mongo')(express); 
var settings = require('./settings'); 

var googleStrategy = new GoogleStrategy({
    //returnURL: 'http://treehole-server.elasticbeanstalk.com/auth/google/return',
    //realm: 'http://treehole-server.elasticbeanstalk.com/'
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/',
    stateless: true
  },
  function(req, profile, done) {
    process.nextTick(function () {
      // profile.identifier = identifier;
      // return done(null, profile);
    	console.log("req:" + util.inspect(req));
    	GoogleUser.findOne({identifier: req}, function(err, user) {
    		if(err) {
    			console.log(err);
    		}
    		if(!err && user != null) {
    			done(null, user);
    		} else {
    			var user = new GoogleUser({
					identifier: req,
					displayName:  profile.displayName,
					email: profile.emails[0].value,
					createDate: Date.now()
    			});
    			user.save(function(err) {
    				if(err) console.log(err);
    				else {
    					done(null, user);
    				}
    			});
    		}
    	});
    });
  }
);

//TODO error occur when initially visit "/return" with the callback data

// googleStrategy.saveAssociation(function(handle, provider, algorithm, secret, expiresIn, done) {
// 	saveAssoc(handle, provider, algorithm, secret, expiresIn, function(err) {
// 		console.log("handle:" + util.inspect(handle));
// 		console.log("provider:" + util.inspect(provider));
// 		console.log("algorithm:" + util.inspect(algorithm));
// 		console.log("secret:" + util.inspect(secret));
// 		console.log("expiresIn:" + util.inspect(expiresIn));
// 		console.log("done:" + util.inspect(done));
// 		if (err) { return done(err) }
// 		return done();
// 	});
// });

// googleStrategy.loadAssociation(function(handle, done) {
// 	loadAssoc(handle, function(err, provider, algorithm, secret) {
// 		console.log("handle:" + util.inspect(handle));
// 		console.log("done:" + util.inspect(done));
// 		if (err) { return done(err) }
// 		return done(null, provider, algorithm, secret)
// 	});
// });

passport.use(googleStrategy);

passport.serializeUser(function(user, done) {
    console.log('serializeUser: ' + user._id)
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	console.log('deserializeUser: ' + id);
    GoogleUser.findOne({_id: id}, function(err, user){
        console.log("deserializeUser User:" + user);
        if(!err) done(null, user);
        else done(err, null)  
    })
});

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
	app.use(express.session({ 
	    secret: settings.cookieSecret/*, 
	    store: new MongoStore({ 
	    	db: settings.db 
	    }) */
   	})); 
   	app.use(passport.initialize());
   	app.use(passport.session());
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
