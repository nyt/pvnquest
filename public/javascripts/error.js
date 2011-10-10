$ = jQuery;

function init(){
	$('button.center').click(function(){
		location.href = '/';
	});
	
	setTimeout(function(){
		location.href = '/';
	}, 5000);
}

$(document).ready(init);
