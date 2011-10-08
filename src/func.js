
var utils = require('./nytUtils.js');
var mongo = require('mongoskin');
var hashlib = require('hashlib');
var mailer = require('nodemailer');

var db = mongo.db('localhost/pvnquest');

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

exports.registCheck = function(what, callback){
	var col = this.getCol('users');
	col.find(what).toArray(function(err, items){
		if(err){ 
			console.log('DB ERROR: ', err);
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

exports.hasTeamCheck = function(what, callback){
	var col = this.getCol('users');
	what.inTeam=
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

exports.registActivate = function(what, data, callback){
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
				data.uname=items[0].uname;
				data.pass=items[0].pass;
			});
			console.log('User is activated');
			callback(true);
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