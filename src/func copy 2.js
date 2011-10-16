
var utils = require('./nytUtils.js');
var mongo = require('mongoskin');
var hashlib = require('hashlib');
var mailer = require('nodemailer');
var async = require('async');

var db = mongo.db('localhost/pvnquest');

function getBRand(){
	var r = Math.round(Math.random());
	return (r==1)?true:false;
};
function getSRand(num){
	return Math.floor(Math.random()*3);
};

var UPDATE_OPT = {upset:false, multi:true, safe:false};
var DEF_ERR = {error: null, advise: null};

mailer.SMTP = {
	host: 'smtp.gmail.com',
	use_authentication: true,
	user: 'bot.pvnquest@gmail.com',
	pass: 'twocamelsinthetinycar'
};

exports.getCol = function(col){ 
	var c;
	c = db.collection(col); 
	if(c && c!==undefined) return c;
	return db.createCollection(col);
};
exports.getObjID = function(idstr){
	return db.bson_serializer.ObjectID(idstr);
};

exports.registUser = function(data, callback){
	var col = this.getCol('users');
	data.pass = hashlib.md5(data.pass);
	data.active = false;
	data.verify = hashlib.md5(data.fname + data.lname + data.uname + (new Date()).getTime());  
	col.insert(data, function(err, objs){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		console.log('Database entry created');
		mailer.send_mail(
			{
				sender: 'bot.pvnquest@gmail.com',
				to: data.email,
				subject:'Pirates vs Ninjas Quest account activation',
				body:
					'Someone has used this e-mail for registration on pvnquest.tk\n'+
					'If it was you, please click on the link below to activate your account\n'+
					'http://pvnquest.tk/activate?h='+data.verify+'\n\n'+
					'Pirates vs Ninjas Quest Bot\n'
			},
			function(error, success){
				if(error){
					console.log('SEND_MAIL ERROR: ', error);
					callback(false);
					return;
				}
				console.log('Message ' + (success ? 'sent' : 'failed'));
				callback(true);
			}
		);
	});
};

exports.loginUser = function(data, callback){
	var col = this.getCol('users');
	data.pass = hashlib.md5(data.pass);
	data.active = true;
	col.find(data).toArray(function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(utils.isArr(items) && items.length>0)
			callback(true, items[0]);
		else{
			console.log('Login failed!');
			callback(false);
		}
	});
};

exports.createTeam = function(data, callback){
	var teams = this.getCol('teams');
	var users = this.getCol('users');
	
	var newTeamId = null;
	var newTeam = {};
	newTeam.name = utils.trim(data.name);
	newTeam.info = utils.trim(data.info);
	newTeam.side = utils.trim(data.side);
	newTeam.mem = [];
	var _ids = [];
		
	var pCheck = { $or : [ data.usr, { email : {$in: []}} ]	};
	var pSet = {team : newTeam.name, side : newTeam.side};		
	for(var i=0; i<3; i++){
		if(i>0){
			pCheck.$or[1].email.$in.push(data.others[i-1]);
		}	
		var r = getSRand(3);
		newTeam.mem[i] = {};
		newTeam.mem[i].ava = (i==0) ? data.creator.ava : 'images/avatars/noplayer.png';
		newTeam.mem[i].spec = (i==0) ? data.creator.spec : ((r==0)?'OFFENCE':((r==1)?'DEFENCE':'SUPPORT'));
		newTeam.mem[i].info = (i==0) ? data.creator.info : '';
	}

	//---- check users
	users.find(pCheck, {_id:1, uname:1, fname:1, lname:1, email:1}).toArray(function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
			callback(false, DEF_ERR);
			return;
		}
		if(!utils.isArr(items) || items.length==0){
			console.log('User authentication failure');
			callback(false, {error:'User authentication failure.', advise:'Please, login on the main page.'});
			return;
		}
		console.log(items);
		if(items.length<3){
			console.log('No users found by specified parameters. Strange.');
			callback(false, DEF_ERR);
			return;
		}
		// --- add user names to team obj
		var c=1;
		for(var i=0; i<3; i++){
			if(items[i].email == data.usr.email){
				newTeam.mem[0].uid = items[i]._id;
				newTeam.mem[0].uname = items[i].uname;
				newTeam.mem[0].fname = items[i].fname;
				newTeam.mem[0].lname = items[i].lname
			}
			else{
				newTeam.mem[c].uid = items[i]._id;
				newTeam.mem[c].uname = items[i].uname;
				newTeam.mem[c].fname = items[i].fname;
				newTeam.mem[c].lname = items[i].lname;
				c++;
			}
			_ids[i] = items[i]._id;
		}
		//--- update users docs with team name and side
		users.update({_id: {$in : _ids}}, {$set:pSet}, UPDATE_OPT, function(err){
			if(err){ 
				console.log('DB ERROR: ', err);
				callback(false, DEF_ERR);
				return;
			}
			db.error(function(err, error){
				if(err){
					console.log('DB ERROR: ', err);
					callback(false, DEF_ERR);
					return;
				}
				if(error[0].n == 0){
					console.log('Update team related info for users failed.');
					callback(false, DEF_ERR);
					return;
				}
				
				// ---- actualy register a team
				teams.insert(newTeam, function(err, items){
					if(err){
						console.log('DB ERROR: ', err);
						callback(false, DEF_ERR);
						return;
					}
					if(!utils.isArr(items) || items.length==0){
						console.log('DB ERROR:  strange one :', err);
						callback(false, DEF_ERR);
						return;
					}
					console.log('New team has been registered successfuly');
					callback(true, {id: items[0]._id.toString()});
				});
			});
		});
	});
};

exports.getTeam = function(data, callback){
	
	var teams = this.getCol('teams');
	var users = this.getCol('users');
	
	teams.findById(data.teamID, function(err, item){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false, DEF_ERR);
			return;
		}
		if(!utils.isObj(item)){
			console.log('No team found by the specified id');
			callback(false, {error: 'No team found by the specified id', advise: 'Please, login on the main page.'});
			return;
		}
		
		var team = item;	
			
		//--- check if user is in the team
		users.findOne({email: data.email, pass: data.pass}, function(err, item1){
			team.viewerInTeam = false;
			if(err){
				console.log('DB ERROR: ', err);
				console.log('Viewer is not in requested team');
			}
			if(utils.isObj(item1)){
				for(var i=0; i<team.mem.length; i++) 
					if(team.mem[0].uid.toString() == item1._id.toString()){
						team.viewerInTeam = true;
						console.log('Viewer IS in request team');
						break;
					}
			}
				
			console.log('Got a team by id.');
			callback(true, team);
		});		
	});
};

exports.createTeamPrep = function(data, callback){
	var users = this.getCol('users');
	
	var viewer = {
		email : data.email,
		pass : data.pass,
	};
	
	var result = {};	
	users.find(viewer, {uname:1, fname:1, lname:1, team:1, side:1}).toArray(function(err, items){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false, DEF_ERR);
			return;
		}
		if(!utils.isArr(items) || items.length==0){
			console.log('User authentication failure');
			callback(false, {error: 'User authentication failure.', advise: 'Please, login on the main page.'});
			return;
		}
		if(items[0].team || items[0].side){
			console.log('U are already in the team, WTF!');
			callback(false, DEF_ERR);
			return;
		}
		
		result.creator = items[0];
		users.find({email: {$ne: data.email}, team: {$exists: false}, side: {$exists: false}}, {email:1, fname:1, lname:1}).toArray(function(err, items){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false, DEF_ERR);
				return;
			}
			if(items.length<2){
				console.log('Not enough players to create a team');
				callback(false, {error: 'Not enough players to create a team', advise: 'Please, tell your friends to register first and then try again.'});
				return;
			}
			
			result.users = items;
			console.log('Create team prep finished');
			callback(true, result);
		});
	});	
};

exports.editTeam = function(data, callback){
	var users = this.getCol('users');
	var teams = this.getCol('teams');
	
	var teamUpdate = {};
	teamUpdate.name = data.name;
	teamUpdate.info = data.info;
	teamUpdate['mem.0.ava'] = 
	
	users.findOne(data.usr, function(err, usrDoc){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isObj(usrDoc)){
			console.log('Auth failure');
			callback(false);
		}
		
		var oldTeamName = userDoc.team;
		
		teamUpdate['mem.0.ava'] = 
		
		teams.findAndModify({name: oldTeamName}, function(err, teamDoc){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false);
				return;
			}
			if(!utils.isObj(teamDoc)){
				console.log('No team, WTF!');
				callback(false);
			}
			
			
			
			for(var i=0; i<teamDoc.mem.length; i++){
				console.log(item1.mem[i].uid);
				console.log(item._id);
				if(item1.mem[i].uid.toString() == item._id.toString()){ 
					result.pos = i;
					break;
				}
			}
			if(result.pos==-1){
				console.log('POLNIY DB ERROR:');
				callback(false);
				return;
			}
			
			callback(true, result);
		});
	});
};

exports.test1 = function(){

	var users = this.getCol('users');
	users.insert({a:1, b:40, c:20}, function(err, items){
		//console.log(items[0]._id);
		//console.log(typeof items[0]._id.toString());
	
		users.findOne({b:40}, {a:1, b:1} , function(err, item){
			console.log('Error: ' +err);
			console.log(item);
			console.log(utils.isObj(item));
		});
	});
	
};

exports.listTeams = function(what, callback){
	var teams = this.getCol('teams');
	
	teams.find(what).toArray(function(err, items){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isArr(items) || items.length==0){
			console.log('No teams found');
			callback(false);
			return;
		}
		
		callback(true, items);
	});
};

exports.teamNameCheck = function(what, callback){
	var col = this.getCol('teams');
	col.find(what).toArray(function(err, items){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(utils.isArr(items) && items.length>0){
			console.log('Team name check fails. Requested name already taken');
			callback(false);
		}else{
			console.log('Team name check success. Requested name are avalible');
			callback(true);
		}
	});
};

exports.registCheck = function(what, callback){
	var col = this.getCol('users');
	col.find(what).toArray(function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(utils.isArr(items) && items.length>0){
			console.log('Regist check fails. Requested items are not avalible');
			callback(false);
		}else{
			console.log('Regist check success. Requested items are avalible');
			callback(true);
		}
	});	
};

exports.getUserPos = function(what, callback){
	var users = this.getCol('users');
	var teams = this.getCol('teams');
	
	var result = {};
	result.pos = -1;
	users.findOne(what, function(err, item){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isObj(item)){
			console.log('Auth failure');
			callback(false);
		}
		
		teams.findOne({name: item.team}, function(err, item1){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false);
				return;
			}
			if(!utils.isObj(item1)){
				console.log('No team, WTF!');
				callback(false);
			}
			
			//console.log(item1);
			for(var i=0; i<item1.mem.length; i++){
				console.log(item1.mem[i].uid);
				console.log(item._id);
				if(item1.mem[i].uid.toString() == item._id.toString()){ 
					result.pos = i;
					break;
				}
			}
			if(result.pos==-1){
				console.log('POLNIY DB ERROR:');
				callback(false);
				return;
			}
			
			callback(true, result);
		});
	});
};

exports.getUserInfo = function(what, callback){
	var col = this.getCol('users');
	col.find(what, {uname:1, fname:1, lname:1}).toArray(function(err, items){
		console.log(items);
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(utils.isArr(items) && items.length==1){
			callback(true, items[0]);
		}else{
			callback(false);
		}
	});
};

exports.hasTeamCheck = function(what, callback){
	var col = this.getCol('users');
	//what.inTeam=
	col.find(what).toArray(function(err, items){
		//TODO
	});
};

exports.checkUser = function(what, callback){
	var col = this.getCol('users');
	col.find(what).toArray(function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
			return;
		}
		console.log(items);
		return;
	});
};

exports.registActivate = function(what, callback){
	var col = this.getCol('users');
	col.update({verify:what, active:false}, {$set:{active:true}}, {upset:false, multi:false, safe:false}, function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		db.error(function(err, error){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false);
				return;
			}
			//---- check the update status
			if(error[0].n == 0){
				console.log('DB UPDATE ERROR');
				callback(false);
				return;
			}
			col.find({verify:what}, {email:1, pass:1}).toArray(function(err, items){
				console.log('User is activated');
				callback(true, items[0]);
			});
		});
	});
}


/*
exports.getUsers = function(){
	var col = this.getCol('users');
	col.find().toArray(function(err, items){
		console.log(items);
	});
};

exports.getUser = function(email){
	var col = this.getCol('users');
	col.find({email:email}).toArray(function(err, items){
		console.log(items);
	});
};
*/