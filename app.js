
/**
 * Module dependencies.
 */

var express = require('express');
var func = require('./src/func.js');
var utils = require('./src/nytUtils.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.get('/team', function(req, res){
	res.render('team');
});

app.get('/adminInterface', function(req, res){
	res.render('admin');
});

app.get('/activate', function(req, res){
	func.registActivate(req.param('h'), function(success){
		console.log('Activation succesful!');
		res.cookie('activated', (success)?'yes':'no', {maxAge: 900000});
		res.redirect('home');
	});
});

//---------- XHR "events"

app.post('/regist', function(req, res){
	//console.log(req.body);
	func.registUser(req.body, function(success){	
		res.header('Content-Type', 'application/json');
		res.json({success: success});		
	});
});

app.post('/login', function(req, res){
	func.loginUser(req.body, function(success, data){	
		res.header('Content-Type', 'application/json');
		var obj = {};
		obj.success = success;
		if(success) {
			obj.uname=data.uname;
			res.cookie('uname', data.uname);
			res.cookie('pass', data.pass);
		}
		res.json(obj);
	});
});

app.get('/listTeams', function(req, res){
	func.listTeams(function(success, data){
		var obj = {};
		obj.success = success;
		if(success){
			obj.list = data; 
		}
		res.json(obj);
	});
});

//----------- XHR CHECKS

app.get('/hasTeamCheck', function(req, res){
	var body = {};
	body.uname = res.cookie('uname');
	body.pass = res.cookie('pass');
	if(data.uname && data.pass){
		func.hasTeamCheck(data, function(success){
			res.json({success:success});
		});
	}
	else{
		res.json({success:false});
	}
});

app.post('/registCheck', function(req, res){
	func.registCheck(req.body, function(success){
		res.header('Content-Type', 'application/json');
		res.json({success:success});
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
