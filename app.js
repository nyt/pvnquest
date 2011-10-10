
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
  res.render('index', {page:'index'});
});

app.get('/team', function(req, res){
	var obj = {};
	obj.email = req.cookies['_pvna'];
	obj.pass = req.cookies['_pvnb'];
	
	obj.teamID = req.param('id');
	obj.action = req.param('action');
	obj.side = req.param('side');
	
	if(!obj.email || !obj.pass){
		res.render('error', {page: 'error', error: 'User authentication failure.', advise: 'Please, login on the main page.'});
		return;
	}
	
	if(obj.action == 'create' && (obj.side=='pirate' || obj.side=='ninja')){
		func.createTeamPrep(obj, function(success, data){
			if(success){
				data.page = 'team_create';
				res.render('team_create', data);
			}
			else{
				data.page = 'error';
				res.render('error', data);
			}
		});
	}	
	else if(obj.teamID){	
		func.getTeam(obj, function(success, data){
			if(success){
				data.page = 'team';
				res.render('team_view', data);
			}else{
				data.page = 'error'
				res.render('error', data);
			}
		});
	}	
	else {
		res.redirect('home');
	}
});


app.get('/error', function(req, res){
	res.write('ERROR');
	res.end();
});
app.get('/notfound', function(req, res){
	res.write('404 Page Not Found');
	res.end();
});

app.get('/adminInterface', function(req, res){
	res.render('admin');
});

app.get('/activate', function(req, res){
	func.registActivate(req.param('h'), function(success, data){
		console.log('Activation succesful!');
		res.cookie('activated', (success)?'yes':'no', {maxAge: 90000});
		if(success){
			res.cookie('_pvna', data.email);
			res.cookie('_pvnb', data.pass);
		}
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

app.post('/createTeam', function(req, res){
	var email = req.cookies['_pvna'],
	 	pass = req.cookies['_pvnb'];
	if(!email || !pass) return;
		
	req.body.usr = {};
	req.body.usr.email = email;
	req.body.usr.pass = pass;
	func.createTeam(req.body, function(success, id){
		if(success)
			//res.redirect('/team?id='+id);
			res.redirect('/notfound');
		else
			res.redirect('/error');
	});
});

app.post('/login', function(req, res){
	func.loginUser(req.body, function(success, data){	
		res.header('Content-Type', 'application/json');
		var obj = {};
		obj.success = success;
		if(success) {
			obj.uname=data.uname;
			res.cookie('_pvna', data.email);
			res.cookie('_pvnb', data.pass);
		}
		res.json(obj);
	});
});

app.post('/listTeams', function(req, res){
	func.listTeams(req.body, function(success, data){
		res.header('Content-Type', 'application/json');
		var obj = {};
		obj.success = success;
		if(success){
			obj.list = data; 
		}
		res.json(obj);
	});
});
/*
app.get('/getUserInfo', function(req, res){
	var body = {};
	body.uname = res.cookie('uname');
	body.pass = res.cookie('pass');
	if(data.uname && data.pass){
		func.getUserInfo(function(success, data){
			
		});
	}
});*/

//----------- XHR CHECKS
app.post('/teamNameCheck', function(req, res){
	//TODO: add cookie check
	func.teamNameCheck(req.body, function(success){
		res.header('Content-Type', 'application/json');
		res.json({success:success});
	});
});

app.get('/hasTeamCheck', function(req, res){
	var body = {};
	body.email = res.cookie('_pvna');
	body.pass = res.cookie('_pvnb');
	
	res.header('Content-Type', 'application/json');
	if(data.email && data.pass){
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


//func.test1();