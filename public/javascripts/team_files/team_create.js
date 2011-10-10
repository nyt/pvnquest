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
			state.$tmName.Watermark('Team title...');
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
				$.Watermark.HideAll();
				var name = this;
				if(name.value.length!=0){
					utils.sendMessage('teamNameCheck', {name:name.value}, function(res){
						if(res.success) $(name).switchClasses('fieldErr', 'fieldCorrect');
						else $(name).switchClasses('fieldCorrect', 'fieldErr');
					});
				}
				else
					$(name).switchClasses('fieldCorrect', 'fieldErr');
				$.Watermark.ShowAll();
			});
			state.$tmInfo.bind('blur', function(){
				$.Watermark.HideAll();
				if(this.value.length==0)
					$(this).switchClasses('fieldCorrect', 'fieldErr');
				else
					$(this).switchClasses('fieldErr', 'fieldCorrect');
				$.Watermark.ShowAll();
			});
			state.$p0_info.bind('blur', function(){
				$.Watermark.HideAll();
				if(this.value.length==0)
					$(this).switchClasses('fieldCorrect', 'fieldErr');
				else
					$(this).switchClasses('fieldErr', 'fieldCorrect');
				$.Watermark.ShowAll();
			});
			state.$p1_name.bind('blur', function(){
				if(!state.t1) state.t1=true;
				if($(this).selectedVal() == state.$p2_name.selectedVal() && state.t2)
					$(this).switchClasses('fieldCorrect', 'fieldErr');
				else{
					state.$p2_name.switchClasses('fieldErr', 'fieldCorrect');
					$(this).switchClasses('fieldErr', 'fieldCorrect');
				}
			});
			state.$p2_name.bind('blur', function(){
				if(!state.t2) state.t2=true;
				if($(this).selectedVal() == state.$p1_name.selectedVal() && state.t1)
					$(this).switchClasses('fieldCorrect', 'fieldErr');
				else{
					state.$p1_name.switchClasses('fieldErr', 'fieldCorrect');
					$(this).switchClasses('fieldErr', 'fieldCorrect');
				}
			});
			
			//---- do registration of a team on create	
			$('#create').click(utils.createTeam);
			
			//--- go back home on cancel
			$('#cancel').click(function(){
				location.href = '/';
			});	
		},
		
		createTeam : function(){
			// --- check if no errors
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
			
			utils.sendMessage('createTeam', obj);
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