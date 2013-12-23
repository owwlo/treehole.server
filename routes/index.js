var ItItem = require('../models/ititem');
var Url = require('url');
var Util = require('util');
var querystring = require('querystring');


module.exports = function(app) { 
  app.get('/', function(req, res) { 
    res.render('index', { 
      title: '首页' 
    }); 
  }); 
   
	app.get('/reg', function(req, res) { 
		res.render('reg', { 
			title: '用户注册', 
		}); 
	}); 

	app.get('/hello', function (req, res) {
		res.send('this time is ' +new Date().toString());
	});

	app.get('/hiddenbyme/:uid', function (req, res) {
		var url_parts = Url.parse(req.url, false);
		var query_obj = querystring.parse(url_parts.query);
		var uid = req.params.uid;

		console.log("hiddenbyme for " + uid);

		var listItems = ItItem.find({deviceId: uid}, function (err, docs) {
			console.log(docs);
			var resArr = [];
			for(var i=0;i<docs.length;i++){
        		var x = docs[i];
				resArr.push({
					content: x["content"],
					lat: x["lat"],
					lon: x["lon"],
					time: x["time"],
					isFound: x["isFound"]
				});
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(resArr));
			res.end();
		});
	});

	app.get('/list/:uid', function (req, res) {
		var url_parts = Url.parse(req.url, false);
		var query_obj = querystring.parse(url_parts.query);
		var uid = req.params.uid;

		console.log("list for " + uid);

		var listItems = ItItem.find({foundBy: uid}, function (err, docs) {
			console.log(docs);
			var resArr = [];
			for(var i=0;i<docs.length;i++){
        		var x = docs[i];
				resArr.push({
					content: x["content"],
					lat: x["lat"],
					lon: x["lon"],
					time: x["time"]
				});
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify(resArr));
			res.end();
		});
	});
	app.get('/getit/:uid', function (req, res) {
		var url_parts = Url.parse(req.url, false);
		var query_obj = querystring.parse(url_parts.query);
		var uid = req.params.uid;
		var lon = parseFloat(query_obj["lon"]);
		var lat = parseFloat(query_obj["lat"]);
		var lon5_str = Math.round(lon*100000)/100000 + '';
		var lat3_str = Math.round(lat*1000)/1000 + '';

		console.log("query: uid="+ uid + " lon="+ lon + " lat="+lat);
		//res.send(Util.inspect(url_parts));

		var fetch_item = ItItem.findOne({lon5: lon5_str, lat3: lat3_str}, function (err, ititem) {
			if(ititem != 'undefined' && ititem.isFound == false && ititem.deviceId != uid) {
				console.log(ititem._id);
				
				ititem.isFound = true;
				ititem.foundBy = uid;
				ititem.save();

				res.writeHead(200, { 'Content-Type': 'application/json' });
    			res.write(JSON.stringify({
    				content: ititem.content
    			}));
			}
    		res.end();
		});
	});

  app.post('/postit/:uid', function (req, res) {
  	var reqJson = (req.body);
  	var deviceId = req.params.uid;
  	var lon = reqJson.lon;
  	var lat = reqJson.lat;
  	var content = reqJson.content;

  	console.log("Request Json: " + reqJson.lon+ (reqJson));

  	var newIt = new ItItem({
  		time: new Date(),
  		deviceId: deviceId,
  		lon: lon,
  		lat: lat,
  		lon5 : Math.round(lon*100000)/100000 + '',
		lat3 : Math.round(lat*1000)/1000 + '',
  		content: content,
  		isFound: false,
  		foundBy: "",
  	});
  	newIt.save(function(err) { 
  		console.log(err);
		if (err) { 
			res.writeHead(500, {'Content-type': 'text/plain'});
			res.end();
			return;
		}
		res.writeHead(200, {'Content-type': 'text/plain'});
		res.end();
    }); 
  });
}; 
