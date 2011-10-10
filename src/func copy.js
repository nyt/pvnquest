
var utils = require('./nytUtils.js');
var mongo = require('mongoskin');
var hashlib = require('hashlib');
var mailer = require('nodemailer');

var db = mongo.db('localhost/pvnquest');

function getBRand(){
	var r = Math.round(Math.random());
	return (r==1)?true:false;
};
function getSRand(num){
	return Math.floor(Math.random()*3);
};

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
				body:'Someone has used this e-mail for registration on pvnquest.tk\n\
					If it was you, please click on the link below to activate your account\n\
					http://pvnquest.tk/activate?h='+data.verify+'\n\n\
					Pirates vs Ninjas Quest Bot'
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
	
	//--- add team name to 1st user
	data.creator.team = newTeam.name;
	data.creator.side = newTeam.side;
	
	var pCheck = [], pSet = [], 
	for(var i=0; i<2; i++){
		var t = utils.trim(data.others[i]).split();
		pCheck = { fname : t[0], lname : t[1] };
		var r = getSRand(3);
		pSet[i] = {
			team : newTeam.name,
			side : newTeam.side,
			ava : 'images/avatars/noplayer.png',
			spec : (r==0)?'OFFENSE':((r==1)?'DEFENSE':'SUPPORT');
		};
	}


	/*
	async.waterfall([
		function(cb){
			users.findAndModify(data.usr, null, {$set: data.creator}, {new:true}).toArray(function(err, items){
				if(err)	
					cb('DB ERROR: '+err);
				if(!utils.isArr(items) || items.length==0){
					cb('User authentication failure.');	
				newTeam.mem[0] = items[0]._id;
				cb(null);
			});
		}, 
		function(cb){
			users.findAndModify(pCheck[0], null, {$set: pSet[0]}, {new:true}).toArray(function(err, items){
				if(err)
					cb('DB ERROR: '+err);
				if(!utils.isArr(items) || items.length==0){
					cb('No user found by specified parameters.');
				newTeam.mem[1] = items[0]._id;
				cb(null);
			});
		},
		function(cb){
			users.findAndModify(pCheck[0], null, {$set: pSet[0]}, {new:true}).toArray(function(err, items2){
				if(err)
					cb('DB ERROR: '+err);
				if(!utils.isArr(items) || items.length==0){
					cb('No user found by specified parameters.');
				newTeam.mem[2] = items[0]._id;
				cb(null);
			});
		},
		function(cb){
			teams.insert(newTeam.)
		}
	
	], function(e){
		if(e){
			console.log(e);
			callback(false);
		}else{
			callback(true, newTeamId);
		}
	}),*/
	
	/*
	users.findAndModify(data.usr, null, {$set: data.creator}, {new:true}).toArray(function(err, items){
		if(err){
			console.log('DB ERROR: ', err);
			callback(false);
			return;
		}
		if(!utils.isArr(items) || items.length==0){
			callback(false);
			return;
		}
		var newTeam.mem[0] = items[0]._id;
		users.findAndModify(pCheck[0], null, {$set: pSet[0]}, {new:true}).toArray(function(err, items1){
			if(err){
				console.log('DB ERROR: ', err);
				callback(false);
				return;
			}
			if(!utils.isArr(items1) || items1.length==0){
				callback(false);
				return;
			}
			var newTeam.mem[1] = items1[0]._id;
			users.findAndModify(pCheck[0], null, {$set: pSet[0]}, {new:true}).toArray(function(err, items2){
				if(err){
					console.log('DB ERROR: ', err);
					callback(false);
					return;
				}
				if(!utils.isArr(items2) || items2.length==0){
					callback(false);
					return;
				}
				var newTeam.mem[2] = items2[0]._id;
				
				// create team
				teams.insert('')
			});	
		});
	});*/
	
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

exports.getUserInfo = function(what, callback){
	var col = this.getCol('users');
	col.find(what, {uname:1, fname:1, lname:1}).toArray(function(err, items){
		if(err){
			console.log('DB ERROR: ', err);
			return;
		}
		if(utils.isArr(items) && items.length>0){
			callback(true, items[0]);
		}
		else{
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
			col.find({verify:what}).toArray(function(err, items){
				var data = {};
				data.uname=items[0].uname;
				data.pass=items[0].pass;
				console.log('User is activated');
				callback(true, data);
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