
/**
 * Module dependencies.
 */

var express = require('express');
var func = require('./src/func.js');
var utils = require('./src/nytUtils.js');

// Initialization 

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

	app.use(function(err, req, res, next) {
  		console.log('error handling: ' + err);
	});

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//----------------- error handling
/*
app.error(function(err, res, req, next){
	

	/*
	if(err instanceof DisplayError){
		console.log('ERROR - ' + err.errObj.brief + '\n   ' + err.errObj.descr);
		res.render('error', err.errObj);
	}
	else if(err instanceof XhrError){
		console.log('ERROR - ' + err.errObj.brief + '\n   ' + err.errObj.descr);
		res.header('Content-Type', 'application/json');
		res.json({success: false, data: err.errObj});
	}
	else if(err instanceof LogError){
		console.log('ERROR - ' + err.errBrief);
		if(err.displayDef)
			res.render('error', {brief: null, descr: null});
	}
	else{
		next(err);
	}
});*/


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
	
	if(obj.action == 'create' && (obj.side=='pirate' || obj.side=='ninja')){
		if(!obj.email || !obj.pass){
			res.render('error', {page: 'error', error: 'User authentication failure.', advise: 'Please, login on the main page.'});
			return;
		}
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

/*
app.get('/adminInterface', function(req, res){
	res.render('admin');
}); */

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
	req.body.usr = {};
	req.body.usr.email = email;
	req.body.usr.pass = pass;
	if(utils.is(email) && utils.is(pass)){
		func.createTeam(req.body, function(success, data){
			res.header('Content-Type', 'application/json');
			var obj = {}
			obj.success = success;
			if(success){
				obj.data = data;
			}
			res.json(obj);
		});
	}else{
		res.json({success:false});
	}
});

app.post('/deleteTeam', function(req, res){
	console.log(req.body);
	func.deleteTeam(req.body, function(success, data){
		//data.page = 'error';
		//res.render('error', data);
		var obj = {}
		obj.success = success;
		if(success){
			obj.data = data;
		}
		res.json(obj);
	});
});

app.post('/editTeam', function(req, res){
	var email = req.cookies['_pvna'],
	 	pass = req.cookies['_pvnb'];
	req.body.usr = {};
	req.body.usr.email = email;
	req.body.usr.pass = pass;
	res.header('Content-Type', 'application/json');
	if(utils.is(email) && utils.is(pass)){
		func.editTeam(req.body, function(success, data){
			res.header('Content-Type', 'application/json');
			var obj = {}
			obj.success = success;
			if(success){
				obj.data = data;
			}
			res.json(obj);	
		});
	}else{
		res.json({success:false});
	}
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

app.post('/getUserInfo', function(req, res){
	var body = {};
	body.email = req.cookies['_pvna'];
	body.pass = req.cookies['_pvnb'];
	if(body.email && body.pass){
		func.getUserInfo(body, function(success, data){
			res.header('Content-Type', 'application/json');
			var obj = {};
			obj.success = success;
			if(success){
				obj.data = data; 
			}
			res.json(obj);
		});
	}else{
		res.header('Content-Type', 'application/json');
		res.json({success:false});
	}
});

//----------- XHR CHECKS
app.post('/teamNameCheck', function(req, res){
	//TODO: add cookie check
	func.teamNameCheck(req.body, function(success){
		res.header('Content-Type', 'application/json');
		res.json({success:success});
	});
});
app.post('/getTeamSide', function(req, res){
	func.getTeamSide(req.body, function(success, data){
		res.header('Content-Type', 'application/json');
		var obj = {}
		obj.success= success;
		if(success){
			obj.side = data;
		}
		res.json(obj);
	});
});

app.get('/hasTeamCheck', function(req, res){
	var body = {};
	body.email = req.cookies['_pvna'];
	body.pass = req.cookies['_pvnb'];
	
	res.header('Content-Type', 'application/json');
	if(body.email && body.pass){
		func.hasTeamCheck(body, function(success){
			res.json({success:success});
		});
	}
	else{
		res.json({success:false});
	}
});

app.get('/getUserPos', function(req, res){
	var body = {};
	body.email = req.cookies['_pvna'];
	body.pass = req.cookies['_pvnb'];
	res.header('Content-Type', 'application/json');
	if(body.email && body.pass){
		func.getUserPos(body, function(success, data){
			var obj = {};
			obj.success = success;
			if(success){
				obj.data = data;
			}
			res.json(obj);
		});
	}
	else res.json({success:false});
});

app.post('/registCheck', function(req, res){
	func.registCheck(req.body, function(success){
		res.header('Content-Type', 'application/json');
		res.json({success:success});
	});
});

/*
app.get('/*', function(req, res){
	console.log("Im default route");
	res.send("def route\n");
});*/


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


//func.test1();