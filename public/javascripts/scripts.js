$ = jQuery;

/* ------------------------------ Statics ------------------------------ */

(function(){
	this.LOGIN_FORM = 
		'<form class="loginForm boardForm">'+
			'<span>Login</span>'+
			'<label for="lf_email">Email: </label><input type="text" id="lf_email"/>'+
			'<label for="lf_pass">Password: </label><input type="password" id="lf_pass"/>'+
			'<input type="submit" id="lf_login" value="Login"/>'+
			'<input type="button" id="lf_cancel" value="Cancel"/>'+
		'</form>';
	this.REGIST_FORM = 
		'<form class="registForm boardForm">'+
			'<span>Registration</span>'+
			'<label for="rf_fname">Your first name:</label><input type="text" id="rf_fname" maxlength=32 />'+
			'<label for="rf_lname">Your last name:</label><input type="text" id="rf_lname" maxlength=32 />'+
			'<label for="rf_uname">Choose a nickname:</label><input type="text" id="rf_uname" maxlength=32 />'+
			'<label for="rf_email">Enter your e-mail:</label><input type="text" id="rf_email" maxlength=32 />'+
			'<label for="rf_pass">Choose a password:</label><input type="password" id="rf_pass" maxlength=32 />'+
			'<label for="rf_repass">Please, retype the password:</label><input type="password" id="rf_repass" maxlength=32 />'+
			'<input type="submit" id="rf_regist" value="Register"/>'+
			'<input type="button" id="rf_cancel" value="Cancel"/>'+
		'</form>'+
		'<div class="registIcons">'+
			'<div id="i_fname" name="rf_fname" class="registIco"></div>'+
			'<div id="i_lname" name="rf_lname" class="registIco"></div>'+
			'<div id="i_uname" name="rf_uname" class="registIco"></div>'+
			'<div id="i_email" name="rf_email" class="registIco"></div>'+
			'<div id="i_pass" name="rf_pass" class="registIco"></div>'+
			'<div id="i_repass" name="rf_repass" class="registIco"></div>'+
		'</div>';
	this.NOTIFICATION = 
		'<div class="notification boardForm">'+
			'<span id="msg"></span>'+
			'<input type="submit" id="msg_ok" value="OK"/>'+
		'</div>';
	this.LOGGED_AS =  
		'Welcome, <span id="loggedUser"></span>!'+
		'<a id="logoutLink" class="lbLink">Logout</a>';
	this.BOARD_CONTENT = 
		'<div class="boardContent boardForm">'+
				//'<span id="boardCaption"></span>'+
		'</div>';
	this.TEAM_LI =
		'<li class="team_li">'+
			'<div class="team_name"></div>'+
			'<div class="team_pic">&#9830;</div>'+
			'<div class="team_info">'+
				'<ul></ul>'+
		'</li>';
	this.ROAMS =
		'<div class="boardContent boardForm">'+
			//'<span>Roams</span>'+
			'<div>Unfortunately, there are no new quests in this tavern...</div>'+
		'</div>';
	this.MISSIONS =
		'<div class="boardContent boardForm">'+
			//'<span>Missions</span>'+
			'<div>Unfortunately, mission board is empty now...</div>'+
		'</div>';
	this.CREWS = 'Currently it seems that there are no pirate crews in this tavern.';
	this.SQUADS = 'Maybe there are several ninja squads in this room, but you don\'t see them.';
	this.RULES =
		'<div class="boardContent boardForm">'+
			'<div class="rules">'+
				'<span>Story</span>'+
				'<p>Nobody remembers how it started... Someone says, that two brothers had a fight over a girl, someone - that it was just beginning of the war for succession, but one is known for sure – since the dawn of time The Great Tournament, ineluctable as sunrise, is held to solve eternal dispute between Pirates and Ninjas. It is told, that last one left undefeated in this bloody massacre receives an absolute power to dominate the world till the next Tournament.</p>'+
				'<span>Rules of The Tournament</span>'+
				'<p>One is known for sure – no mortal can compete in it alone. Only combination of three ones gives a chance to fight for eternal glory.</p>'+
				'<p><em>Only teams of exaclty 3 people are allowed to participate in the quest, e.g. teams with 2, 4 or 1 person are not allowed, so please find your teammates a.s.a.p.</em>.</p>'+
				'<p>When teams fight against each other they use ancient symbols of powe as weapons. There are five of them – Monkey, Robot, Zombie, Pirate and Ninja. The picture below depicts ancient rule that ties symbols together.</p>'+
				'<div class="rulesImg"></div>'+
				'<p><em>Each team has 5 tokens. In the beginning of each round every team places 1 token in front with picture pointing downward. The winner is determined according to the relations that are described in picture. E.g. robot beats ninja, and monkey beats robot. Each battle is fought up to tree victories.</em></p>'+
				'<p>It is told, when magic of token is released one member of opposite team is knocked down.</p>'+
				'<p><em>Winning team determines, which player of opposite team is knoked out.</em></p>'+
				'<p>For numerous years some captains and clan elders have trained their best followers for participating The Tournament. Specialized in powerful attacks or absolute defense team members have proven to be able to greatly influence the outcome of battle. But tokens of power require additional energy sources to release full potential of their users, so searching for those sources had been a reason for frequent small fights.</p>'+
				'<em>Each member can chose his class from 3 available. Every class can use its ability for a price of 1 action point that can be found during quest. OFFENCE class add one additional token at the beginning of round. In such case team wins if any of its tokens wins. DEFENCE class can use its ability in beginning of the round to make the team defeat count as a draw. SUPPORT class can use any of this two abilities, if the respective class is present in this battle. Users that are knoked out cannot use their abilities.</em></p>'+
			'</div>'+
		'</div>';

	this.COLOR_LIGHT = '#FFFFFF';
	this.COLOR_DARK = '#220000';
		
	this.imageCache = [];
	this.IMG_LINKS = {
		unsel:[
		'images/menu/p1.png',
		'images/menu/p2.png',
		'images/menu/p3.png',
		'images/menu/n1.png',
		'images/menu/n2.png',
		'images/menu/n3.png'
		],
		sel: [
		'images/menu/p1h.png',
		'images/menu/p2h.png',
		'images/menu/p3h.png',
		'images/menu/n1h.png',
		'images/menu/n2h.png',
		'images/menu/n3h.png'
		]
	};
})();

/* ------------------------------ Main Stuff ------------------------------ */

(function(){
	this.doc = document;
	
	this.utils = {
		add:function(tag, parent){
			var el = doc.createElement(tag);
			if(parent && parent!==undefined) parent.appendChild(el);
			return el;
		},
		
		delAttr: function($elem, attr){
			//TODO: check if $elem is $ object
			$elem.attr(attr, '');
			$elem.removeAttr(attr);
		},
				
		menuClick: function(index){
			var sel = state.selButton;
			if(sel!=-1) {
				utils.delAttr( $(state.$buttons[sel]), 'style' );
			}
			if(sel==index){
				sel = -1;
				utils.showBoard('hide');
			}
			else{
				sel = index;
				$(state.$buttons[sel]).css('background-image', 'url(\'' + IMG_LINKS.sel[sel] + '\')');
				utils.showBoard((index<3)?'pirates':'ninjas');
				utils.inflateBoard(index);
				utils.boardContent(index);
			}
			state.selButton = sel;
		},
		
		showBoard: function(what){
			if(what=='hide')
				state.$board.css('visibility', 'hidden');
			else if(what=='other'){
				state.$board.css('visibility', 'visible');
				state.$board.css('background-image', 'url(\'images/board.png\')');
				state.$board.css('color', COLOR_LIGHT);
			}else if(what=='pirates'){
				state.$board.css('visibility', 'visible');
				state.$board.css('background-image', 'url(\'images/board_p.png\')');
				state.$board.css('color', COLOR_DARK);
			}else if(what=='ninjas'){
				state.$board.css('visibility', 'visible');
				state.$board.css('background-image', 'url(\'images/board_n.png\')');
				state.$board.css('color', COLOR_LIGHT);
			} else if(what=='toad'){
				state.$toad.css('visibility', 'visible');
			}
		},
		
		inflateBoard: function(what){
			if(what=='loginForm'){
				state.$board.html(LOGIN_FORM);
				$('#lf_login').unbind('click').click(utils.loginHandler);
				$('#lf_cancel').unbind('click').click(function(){
					utils.showBoard('hide');
				});
			}else if(what=='registForm'){
				state.$board.html(REGIST_FORM);
				$('#rf_regist').unbind('click').click(utils.registHandler);
				$('#rf_cancel').unbind('click').click(function(){
					utils.showBoard('hide');
				});
				$('.registForm input[type*="text"], .registForm input[type*="password"], .registForm input[type*="email"]').unbind('blur').bind('blur', utils.registCheck);
			}else if(what=='notification'){
				state.$board.html(NOTIFICATION);
				$('#msg_ok').unbind('click').click(function(){
					utils.showBoard('hide');
					return false;
				});
			}else if(what==0 || what==3){
				state.$board.html(BOARD_CONTENT);
			}else if(what==1){
				state.$board.html(ROAMS);
			}else if(what==4){
				state.$board.html(MISSIONS);
			}else if(what==2 || what==5){
				state.$board.html(RULES);
			}
		},
		
		boardContent: function(what){
			var $boardContent = $('.boardContent');
			//var $boardCaption = $('#boardCaption');
			
			if(what==0 || what==3){
				//$boardCaption.html((what==0)?'Crews':'Squads');
				
				var $teamList = $(doc.createElement('ul'));
				$teamList.addClass('teamList');
				//---- get list of teams
				utils.getListOfTeams( (what==0)?'pirate':'ninja', function(res){
					if(res.success){
						for(var i=0; i<res.list.length; i++){
							var team = res.list[i];

							var $teamli = $(TEAM_LI);
							var $teamName = $teamli.find('.team_name');

							$teamName.unbind('click').click(function(){
								location.href = '/team?id='+team._id;
							});

							//var $teamImg = $teamli.find('.team_pic');
							//$teamImg.attr('src','images/defteam.png');
							
							var $team_mems = $teamli.find('.team_info ul');

							for(var j=0; j<3; j++){
								var mem = team.mem[j];
								var $team_mem = $(doc.createElement('li'));
								$team_mem.html(mem.uname + ' [' + mem.fname + ' ' + mem.lname + ']');
								$team_mems.append($team_mem);
							}
							$teamList.append($teamli);
						}
					}else{
						$teamList.html((what==0) ? CREWS : SQUADS);
					}
				});
				
				$boardContent.append($teamList);
				utils.hasTeamCheck(function(res){
					if(res.success){
						//$teamList.html($teamList.html() + ((what==0) ? 'Go, gather your crew! Yarr!' : 'Wanna create ninja squad yourself?'))
						
						var $createNew = $(doc.createElement('button'));
						$createNew.addClass((what==0)?'createNewCrew':'createNewSquad');
						$createNew.html('Create');
						$boardContent.append($createNew);
						$createNew.unbind('click').click(function(){
							var l = ('/team?action=create&side=' + ((what==0)?'pirate':'ninja'));
							console.log(l);
							location.href = l;
						});
					}
				});
			}
		},
		
		getListOfTeams: function(which, callback){
			utils.sendMessage('listTeams', {side:which}, callback);
		},
		hasTeamCheck: function(callback){
			utils.sendMessage('hasTeamCheck', null, callback);
		},
		
		loginHandler: function(){
			var data={};
			data.email = $('#lf_email').val();
			data.pass = $('#lf_pass').val();
			if(data.email.length==0 || data.pass.length==0){
				alert('Please enter email and password');
				return false;
			}
			utils.sendMessage('login', data, function(data, status){
				utils.inflateBoard('notification');
				if(data.success) {
					$('#msg').html('Login succesful.');
					utils.loggedUser();
				}else
					$('#msg').html('Login failed.');
			});
			return false;
		},
		
		registHandler: function(){
			if(!utils.registAllCor()){
				alert('Please fill out all the fields correctly.');
				return false;
			}
			var data={};
			data.uname = $('#rf_uname').val();
			data.fname = $('#rf_fname').val();
			data.lname = $('#rf_lname').val();
			data.email = $('#rf_email').val();
			data.pass = $('#rf_pass').val();
			utils.sendMessage('regist', data, function(data, status){
				utils.inflateBoard('notification');
				if(data.success)
					$('#msg').html('Registration succesful. Please check your email to activate your account.');
				else
					$('#msg').html('Registration failed due to server error. Please try again later.');					
			});
			return false;
		},
		
		registCheck: function(){
			var imgObj=$('[name*='+this.id+']');
			imgObj.removeClass();
			if(this.id=='rf_email') {
				if( (/.*@.*\..*/gi).test(this.value)){
					utils.sendMessage('registCheck', {email:this.value}, function(res){
						if(!res.success)
							imgObj.addClass('registIco errIco');
						else
							imgObj.addClass('registIco corIco');
					});
				}else
					imgObj.addClass('registIco errIco');
			}else if(this.id=='rf_uname'){
				if(this.value=='')
					imgObj.addClass('registIco errIco');
				else {
					imgObj.addClass('registIco corIco');
				}
			}else if(this.id=='rf_repass'){
				if($('#rf_pass').val()==$('#rf_repass').val() && $('#rf_repass').val()!='')
					imgObj.addClass('registIco corIco');
				else
					imgObj.addClass('registIco errIco');
			}else{
				if(this.value=='')
					imgObj.addClass('registIco errIco');
				else
					imgObj.addClass('registIco corIco');
			}
		},
		
		registAllCor: function(){
			return ($('#i_fname').hasClass('corIco') &&
				$('#i_lname').hasClass('corIco') &&
				$('#i_uname').hasClass('corIco') &&
				$('#i_email').hasClass('corIco') &&
				$('#i_pass').hasClass('corIco') &&
				$('#i_repass').hasClass('corIco'));
		},
		
		registActivate: function(){
			//console.log($.cookie('activated'));
			if($.cookie('activated') == 'yes'){
				$.cookie('activated', null);
				utils.inflateBoard('notification');
				$('#msg').html('Your account was activated!');
				utils.showBoard('other');
			}else if($.cookie('activated') == 'no'){
				$.cookie('activated', null);
				utils.inflateBoard('notification');
				$('#msg').html('Wrong activation code!');
				utils.showBoard('other');
			}
		},
		
		logoutHandler: function(){
			$.cookie('_pvna', null);
			$.cookie('_pvnb', null);
			location.href='/';
		},
		
		loggedCheck:function(){
			return ($.cookie('_pvna') != null && $.cookie('_pvna') != null);;
		},
 
		loggedUser: function(){
			var email = $.cookie('_pvna');
			var pass = $.cookie('_pvnb');
			
			if(email && pass){
				/* ------- Get uname from DB -------*/
				utils.sendMessage('getUserInfo', {email:email, pass:pass}, function(res){
					if(res.success) {
						$('#loggedUser').html(res.data.uname);
				}
			})

			$('.loginBlock').html(LOGGED_AS);
			$('#logoutLink').unbind('click').click(utils.logoutHandler);
							
			/* ------- TODO Change content of crew/squads block -------- */
			}
		},


		updateNews: function(){
			//TODO
		},
		
		// ---- callback(data, status)
		sendMessage: function(type, data, callback){
			$.ajax({
				url: type,
				data: data,
				type: (data)?'POST':'GET',
				success: callback,	
			});
		}
	};
	
	this.state = {
		$board: null,
		$buttons: null,
		selButton: -1,
	};

	// ---- preinit operations
	$.each(IMG_LINKS.sel, function(index, val){
		var img = new Image();
		img.src = val;
		imageCache.push(img);
	})
})();


/* ------------------------------ Initialization operations ------------------------------ */

function init(){
	//---- assign states
	state.$board = $('.board');
	state.$buttons = $('.menuButton');

	//---- assign click handler for hiding BOARD
	$('.mainBody').get(0).addEventListener('click', function(event){
		var target = event.target || event.srcElement;
		if($(target).hasClass('hb')){
			utils.menuClick(state.selButton);
		}
	}, false);

	//---- assign buttons click handlers
	state.$buttons.each(function(index, elem){
		$(elem).click(function(){
			utils.menuClick(index);
		});
	});
	
	//---- assign login/register links handlers
	$('#loginLink').click(function(){
		utils.menuClick(state.selButton);
		utils.inflateBoard('loginForm');
		utils.showBoard('other');
	});
	$('#registLink').click(function(){
		utils.menuClick(state.selButton);
		utils.inflateBoard('registForm');
		utils.showBoard('other');
	});

	//---- assign secret click handler
	$('.toggleSecret').hover(function(){
		$('.secret').css('visibility','visible');
	});
	
	//---- check for registration activation redirect
	utils.registActivate();
	
	//---- check if user is logged
	utils.loggedUser();

	//---- load news
	utils.updateNews();
	
}
$(document).ready(init);

