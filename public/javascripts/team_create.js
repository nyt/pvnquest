$ = jQuery;

(function( $ ) {
	$.fn.switchClasses = function(from, to) {
		this.removeClass(from);
		this.addClass(to);
	};
	$.fn.selectedVal = function(){
		var el = this.get(0);
		if(el.tagName == 'SELECT' || el.tagName == 'select'){
			return el.options[el.selectedIndex].value;
		}
		return null;
	};
})( jQuery );

(function(){
	this.TOTAL_AVATARS = 16;
	
	
	this.state = {
		$tmName : null,
		$tmInfo : null,
		
		$p0 : null,	
		$p0_ava : null,
		$p0_info : null,
		
		$p1_name : null,
		$p2_name : null,
		
		avaIndex : 0,
		side : null,
		t1: false,
		t2: false
	};

	this.utils = {
		
		querySide : function(){
			var s = location.search;
			if(s.indexOf('side=pirate')!=-1) state.side = 'pirate';
			else if(s.indexOf('side=ninja')!=-1) state.side = 'ninja';
		},
		
		avaChange : function($img, plus){
			var i = state.avaIndex;	
			i += plus;
			
			if(i<0) i=TOTAL_AVATARS;
			else if(i>TOTAL_AVATARS) i=0;
				
			if(i == 0) 
				$img.attr('src', '/images/avatars/noplayer.png');
			else 
				$img.attr('src', '/images/avatars/' + state.side + '_' + i + '.png');
				
			state.avaIndex = i;
		},
		
		setWatermarks : function(){
			state.$tmName.Watermark("Team title...");
			state.$tmInfo.Watermark("Team legend...");
			state.$p0_info.Watermark("Your legend...");
		},
		
		setHandlers : function(){
			//--- image switch hanlers		
			state.$p0.find('.arrowl').click(function(){
				utils.avaChange(state.$p0_ava, -1);
			});
			state.$p0.find('.arrowr').click(function(){
				utils.avaChange(state.$p0_ava, +1);
			});
			
			//--- input field checkers
			state.$tmName.bind('blur', function(){
				utils.teamNameCheck(state.$tmName);
			});
			state.$tmInfo.bind('blur', function(){
				utils.infoFieldCheck(state.$tmInfo);
			})
			state.$p0_info.bind('blur', function(){
				utils.infoFieldCheck(state.$p0_info);
			});
			state.$p1_name.bind('blur', function(){
				utils.othersCheck(state.$p1_name, state.$p2_name);
			});
			state.$p2_name.bind('blur', function(){
				utils.othersCheck(state.$p2_name, state.$p1_name);
			});
			
			//---- do registration of a team on create	
			$('#create').click(utils.createTeam);
			
			//--- go back home on cancel
			$('#cancel').click(function(){
				location.href = '/';
			});	
		},
		
		teamNameCheck : function($name){
			$.Watermark.HideAll();
			if($name.val().length!=0){
				utils.sendMessage('teamNameCheck', {name:$name.val()}, function(res){
					if(res.success) $name.switchClasses('fieldError', 'fieldCorrect');
					else $name.switchClasses('fieldCorrect', 'fieldError');
				});
			}
			else
				$name.switchClasses('fieldCorrect', 'fieldError');
			$.Watermark.ShowAll();
		},
 
		infoFieldCheck : function($field){
			$.Watermark.HideAll();
			if($field.val().length==0)
				$field.switchClasses('fieldCorrect', 'fieldError');
			else
				$field.switchClasses('fieldError', 'fieldCorrect');
			$.Watermark.ShowAll();
		},
 
		othersCheck : function($field1, $field2){
			if($field1.selectedVal()!=$field2.selectedVal()){
				if($field1.selectedVal().length>0)
					$field1.switchClasses('fieldError', 'fieldCorrect');
				else
					$field1.switchClasses('fieldCorrect', 'fieldError');
				if($field2.selectedVal().length>0)
					$field2.switchClasses('fieldError', 'fieldCorrect');
				else
					$field2.switchClasses('fieldCorrect', 'fieldError');
			}else{
				$field1.switchClasses('fieldCorrect', 'fieldError');
				$field2.switchClasses('fieldCorrect', 'fieldError');
			}		
		},
		
		createTeam : function(){
			// --- check if no errors
			utils.teamNameCheck(state.$tmName);
			utils.infoFieldCheck(state.$tmInfo);
			utils.infoFieldCheck(state.$p0_info);
			utils.othersCheck(state.$p1_name, state.$p2_name);
			
			if( $('.fieldCorrect').length != 5){
				alert('Some fields might be wrong. Please, check all fields again.')
				return;
			};
			
			var obj = {};
			obj.name = state.$tmName.val();
			obj.info = state.$tmInfo.val();
			obj.side = state.side;
			obj.creator = {
				ava : state.$p0_ava.attr('src'),
				spec : state.$p0_spec.selectedVal(),
				info : state.$p0_info.val()
			};
			var p2_nf = state.$p2_name.get(1);
			obj.others = [
				state.$p1_name.selectedVal(), 
				state.$p2_name.selectedVal()
			];
			
			utils.sendMessage('createTeam', obj, function(res){
				if(res.success){
					location.href = '/team?id='+res.data.id;
				}else{
					alert("Server error");
				}
			});
		},
		
		getSelectors : function(){
			state.$tmName = $('.titleBlock input');
			state.$tmInfo = $('.teamInfo textarea');
			
			state.$p0 = $('#p0');
			state.$p0_ava = state.$p0.find('.memberAvatar img');
			state.$p0_spec = state.$p0.find('.pSpec > select');
			state.$p0_info = state.$p0.find('.pInfo > textarea');
			
			state.$p1_name = $('#p1 .pName select');
			state.$p2_name = $('#p2 .pName select');
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
	utils.querySide();
	utils.getSelectors();
	utils.setWatermarks();
	utils.setHandlers();
}

$(document).ready(init);