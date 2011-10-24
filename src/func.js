
var utils = require('./nytUtils.js');
var mongo = require('mongoskin');
var hashlib = require('hashlib');
var mailer = require('nodemailer');
//var async = require('async');

var db = mongo.db('localhost/pvnquest');

function getBRand(){
	var r = Math.round(Math.random());
	return (r==1)?true:false;
};
function getSRand(num){
	return Math.floor(Math.random()*3);
};

var UPDATE_OPT_MULTI = {upset:false, multi:true, safe:false};
var UPDATE_OPT = {upset:false, multi:false, safe:false};
var DEF_ERR = {error: null, advise: null};
var NOT_FOUND = {error: '404', advise: 'No page found'};
var TEAM_DELETED = {error: 'Success', advise: 'Team succesfully deleted'};

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
		users.update({_id: {$in : _ids}}, {$set:pSet}, UPDATE_OPT_MULTI, function(err){
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
		if(item==null){
			console.log('No team found by the specified id');
			callback(false, NOT_FOUND);
			return;
		}

		console.log(data.teamID);
		console.log(item);
		var team = item;
			
		//--- check if user is in the team
		users.findOne({email: data.email, pass: data.pass}, function(err, item1){
			team.viewerInTeam = false;
			if(err){
				console.log('DB ERROR: ', err);
				callback(false, DEF_ERR);
				return
			}
				
			if(utils.isObj(item1) && item1!=null){
				for(var i=0; i<team.mem.length; i++) 
					if(team.mem[i].uid.toString() == item1._id.toString()){
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

exports.deleteTeam = function(data, callback){
	var teamName=data.teamName;

	var users = this.getCol('users');
	var teams = this.getCol('teams');

	teams.remove({name:teamName});
	users.update({team:teamName}, {$unset:{side:1, team:1}}, UPDATE_OPT_MULTI, function(err){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false, DEF_ERROR);
			}
			callback(true, TEAM_DELETED);
	});
}

exports.editTeam = function(data, callback){
	var users = this.getCol('users');
	var teams = this.getCol('teams');
	
	var teamUpdate = {};
	teamUpdate.name = data.name;
	teamUpdate.info = data.info;
	
	users.findOne(data.usr, function(err, usrDoc){
		if(err){ console.log('DB ERROR: ', err); callback(false); return;}
		if(!utils.isObj(usrDoc)){
			console.log('Auth failure');
			callback(false);
			return;
		}
		
		var oldTeamName = usrDoc.team;
		teams.findOne({name: oldTeamName}, function(err1, teamDoc){
			if(err1){ console.log('DB ERROR: ', err1); callback(false); return;}
			if(!utils.isObj(teamDoc)){
				console.log('No team, WTF!');
				callback(false);
				return;
			}
			
			var usrPos = -1;
			for(var i=0; i<teamDoc.mem.length; i++){
				if(teamDoc.mem[i].uid.toString() == usrDoc._id.toString()){ usrPos=i; break;}
			}
			if(usrPos==-1){
				console.log('No pos, WTF!');
				callback(false);
				return;
			}
			
			teamUpdate['mem.'+ usrPos +'.ava'] = data.editPlayer.ava;
			teamUpdate['mem.'+ usrPos +'.info'] = data.editPlayer.info;
			teamUpdate['mem.'+ usrPos +'.spec'] = data.editPlayer.spec;
			teams.update({name: oldTeamName}, {$set: teamUpdate}, UPDATE_OPT, function(err2){
				if(err2){ console.log('DB UPDATE ERROR: ', err2); callback(false); return;}
				db.error(function(err3, error){
					if(err3){ console.log('DB UPDATE ERROR: ', err3); callback(false); return;}
					//---- check the update status
					if(error[0].n == 0){
						console.log('DB UPDATE ERROR!!!');
						callback(false);
						return;
					}
					
					if(data.name!=oldTeamName){
						users.update({team: oldTeamName}, {$set:{team: data.name}}, UPDATE_OPT_MULTI, function(err4){
							if(err4){console.log('DB UPDATE ERROR (DB is definitely broken): ', err4); callback(false); return;}
							db.error(function(err5, error){
								if(err5){console.log('DB UPDATE ERROR (DB is definitely broken): ', err3); callback(false); return;}
								//---- check the update status
								if(error[0].n == 0){
									console.log('DB UPDATE POLNIY ERROR (DB is definitely broken)');
									callback(false);
									return;
								}
								callback(true);
							});
						});
					}else{
						callback(true);
					}
				});
			});	
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

exports.getTeamSide = function(what, callback){
	var col = this.getCol('teams');
	col.findById(what.teamId, function(err, item){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isObj(item)){
			callback(false);
			return;
		}
		callback(true, item.side);
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
	col.findOne(what, function(err, item){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isObj(item)){
			console.log('User authentication error.');
			callback(false);
			return;
		}
		if(item.team) callback(false);
		else callback(true);
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
				console.log('User '+ items[0].email +' is activated');
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