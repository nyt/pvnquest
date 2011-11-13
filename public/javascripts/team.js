$ = jQuery;

(function( $ ) {
	$.fn.selectOption = function(option) {
		this.find('option').each(function(index, elem){
			if(elem.value == option){
				elem.setAttribute('selected','');
				return false;
			}
		});
	};
	$.fn.selectedVal = function(){
		var el = this.get(0);
		if(el.tagName == 'SELECT' || el.tagName == 'select'){
			return el.options[el.selectedIndex].value;
		}
		return null;
	};
	$.fn.switchClasses = function(from, to) {
		this.removeClass(from);
		this.addClass(to);
	};
})( jQuery );

(function(){
	
	this.SPEC_SELECT = 
		'<select>\
			<option>OFFENCE</option>\
			<option>DEFENCE</option>\
			<option>SUPPORT</option>\
		</select>';
	this.TOTAL_AVATARS = 16;

})();

(function(){
	
	this.state = {
		avaIndex : 0,
		
		$p : null,
		teamName : null,
		teamSide : null
	},
	
	this.utils = {
	
		avaChange : function($img, plus){
			var i = state.avaIndex;
			
			i += plus;
			
			if(i<0)
				i=TOTAL_AVATARS;
			else if(i>TOTAL_AVATARS)
				i=0;
				
			if(i == 0)
				$img.attr('src', '/images/avatars/noplayer.png');
			else
				$img.attr('src', '/images/avatars/' + state.teamSide + '_' + i + '.png');
			
			state.avaIndex = i;
		},
			
		getUserPos : function(callback){
			utils.sendMessage('getUserPos', null, callback);
		},
		
		editTeamChange : function(){
			var $titleBlock = $('.titleBlock');
			state.teamName = $titleBlock.html();
			$titleBlock.html('<input type="text" value="'+ state.teamName +'"/>');
			var $titleInput = $titleBlock.children('input');
			$titleInput.unbind('blur').bind('blur', function(){
				utils.teamNameCheck($titleInput);
			});
			
			var $teamInfo = $('.teamInfo');
			$teamInfo.html('<textarea>'+ $teamInfo.html() +'</textarea>');
			var $teamInfoTA = $teamInfo.children('textarea');
			$teamInfoTA.unbind('blur').bind('blur', function(){
				utils.infoFieldCheck($teamInfoTA);
			});
		
			utils.getUserPos(function(res){
				if(res.success){
				
					var usrPos = res.data.pos;
					
					state.$p = $('#p'+usrPos);
					
					var $p_ava =state.$p.children('.memberAvatar');
					$p_ava.prepend('<button class="arrowl"/>');
					$p_ava.children('img').css('float', 'left');
					$p_ava.append('<button class="arrowr"/>');
					
					var $arrowL = $p_ava.children('.arrowl');
					$arrowL.unbind('click').click(function(){
						utils.avaChange($p_ava.children('img'), -1);
					});
					var $arrowR = $p_ava.children('.arrowr');
					$arrowR.unbind('click').click(function(){
						utils.avaChange($p_ava.children('img'), +1);
					});
					
					var $pSpec = state.$p.find('.pSpec');
					var $pInfo = state.$p.find('.pInfo');
					var selectedSpec = $pSpec.html();
					$pSpec.html(SPEC_SELECT);
					$pSpec.selectOption(selectedSpec);
					state.$p.find('.pInfo').html('<textarea>'+ $pInfo.html() +'</textarea>');
					var $pInfoTA = state.$p.find('.pInfo > textarea');
					$pInfoTA.unbind('blur').bind('blur', function(){
						utils.infoFieldCheck($pInfoTA);
					});
					
					$('#edit').html('Confirm').unbind('click').click(utils.editTeam);
					$('#delete').html('Cancel').unbind('click').click(function(){
						location.reload();
					});
				}
			});
		},
		
		teamNameCheck : function($name){
			if($name.val().length!=0){
				if(state.teamName == $name.val()){
					$name.switchClasses('fieldError', 'fieldCorrect');
				}else{
					utils.sendMessage('teamNameCheck', {name:$name.val()}, function(res){
						if(res.success) $name.switchClasses('fieldError', 'fieldCorrect');
						else $name.switchClasses('fieldCorrect', 'fieldError');
					});
				}
			}
			else
				$name.switchClasses('fieldCorrect', 'fieldError');
		},
		infoFieldCheck : function($field){
			if($field.val().length==0)
				$field.switchClasses('fieldCorrect', 'fieldError');
			else
				$field.switchClasses('fieldError', 'fieldCorrect');
		},
		
		getTeamSide : function(callback){
			var q = location.search;
			console.log(q);
			var id = q.substr(q.indexOf('id=')+3);
			utils.sendMessage('getTeamSide', {teamId:id}, callback);
		},
		
		editTeam : function(){
		
			var $tmName = $('.titleBlock input');
			var $tmInfo = $('.teamInfo textarea');

			var $p_ava = state.$p.find('.memberAvatar img');
			var $p_spec = state.$p.find('.pSpec > select');
			var $p_info = state.$p.find('.pInfo > textarea');
			
			utils.teamNameCheck($tmName);
			utils.infoFieldCheck($tmInfo);
			utils.infoFieldCheck($p_info);
			
			if( $('.fieldCorrect').length != 3){
				alert('Some fields might be wrong. Please, check all fields again.')
				return;
			};
			
			var obj = {};
			obj.name = $tmName.val();
			obj.info = $tmInfo.val();
			obj.editPlayer = {
				ava : $p_ava.attr('src'),
				spec : $p_spec.selectedVal(),
				info : $p_info.val()
			};
			
			utils.sendMessage('editTeam', obj, function(res){
				if(res.success){
					location.reload();
				}else{
					alert("Server error");
				}
			});
			
		},
		
		deleteTeam : function(){
			var obj = {};
			obj.teamName = $('.titleBlock').html();
			utils.sendMessage('deleteTeam', obj, function(res){
				if(res.success)
					location.href = "/";
				else{
					alert(res.error + '\n\n' + res.advise);
				}
			});
		},
		
		initCheck : function(){
			//var email = $.cookie('_pvna');
			//var pass = $.cookie('_pvnb');
			$('#back').click(function(){
				location.href="/";
			});
			$('#edit').click(function(){
				utils.editTeamChange();
			});
			$('#delete').click(function(){
				var c = confirm("Are you sure, you want to delete your team?");
				if(c==true)
					utils.deleteTeam();
			});
			
			utils.getTeamSide(function(res){
				if(res.success){
					state.teamSide = res.side;
				}
			});
			
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