$ = jQuery;

(function(){
	
	this.SPEC_SELECT = 
		'<select>\
			<option value="offence">OFFENCE</option>\
			<option value="defence">DEFENCE</option>\
			<option value="support">SUPPORT</option>\
		</select>';
	this.TOTAL_AVATARS = 16;

})();


(function(){
	
	this.state = {
		avaIndex : 0
	},
	
	
	this.utils = {
	
		avaChange : function($img, plus){
			var i = state.avaIndex;
			
			i += plus;
			
			if(i<0)
				i=TOTAL_AVATARS;
			else if(i>TOTAL_AVATARS)
				i=0;
				
			var side = $.cookie('side');
			if(i == 0)
				$img.attr('src', '/images/avatars/noplayer.png');
			else
				$img.attr('src', '/images/avatars/' + side + '_' + i + '.png');
				
			state.avaIndex = i;
		},
		
		createTeamChange : function(){
			$('.titleBlock').html('<input type="text" value="Team title"/>');
			$('.teamInfo').html('<textarea id="tf_info"/>');
			
			var $p1 = $('#p1');
			
			var $p_ava =$p1.children('.memberAvatar');
			$p_ava.prepend('<button class="arrowl"/>');
			$p_ava.children('img').css('float', 'left');
			$p_ava.append('<button class="arrowr"/>');
			
			var arrowL = $p_ava.children('.arrowl');
			arrowL.unbind('click').click(function(){
				utils.avaChange($p_ava.children('img'), -1);
			})
			var arrowR = $p_ava.children('.arrowr');
			arrowR.unbind('click').click(function(){
				utils.avaChange($p_ava.children('img'), +1);
			})
			
			utils.sendMessage('getUserInfo', null, function(res){
				if(res.success){
					$p1.children('.memberName').html(res.info.uname);
					$p1.find('.pName').html(res.info.fname + ' ' + res.info.lname);
				
					$p1.find('.pSpec').html(SPEC_SELECT);
					$p1.find('.pInfo').html('<textarea />');
				}
			});
			
			
		},
		
		editTeamChange : function(){
			
		},
		
		
		initCheck : function(){
		
			var uname = $.cookie('uname');
			var pass = $.cookie('pass');
			var edit = $.cookie('edit');
			console.log(uname);
			console.log(pass);
			console.log(edit);
			if(uname && pass && edit){
				if(edit=='edit')
				 	utils.editTeamChange();
				else if (edit=='create')
					utils.createTeamChange();
			}
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
	
})();


function init(){
	utils.initCheck();
}

$(document).ready(init);