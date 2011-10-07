
/* ------------------------------------------- */
/* ------------- signals and slots --------------------*/

exports.connect = function(signalObj, signal, slotObj, slot){
	if(this.isStr(signal)&&
	this.isStr(slot)&&
	this.isObj(signalObj)&&
	this.isObj(slotObj)&&
	this.isFun(slotObj[slot])&&
	this.isFun(signalObj["emit_"+signal])){
		if(!signalObj.__sigs__[signal][slot]) signalObj.__sigs__[signal][slot]=[];
		signalObj.__sigs__[signal][slot].push(slotObj);
		return true;
	}
	return false;
};

exports.addSignal = function(sigObj, signal){
	if(!this.is(sigObj.__sigs__))sigObj.__sigs__={};
	if(this.isArr(signal)){
		for(var i=0; i<signal.length; i++){
			var sig=signal[i];
			sigObj.__sigs__[sig]={};
			sigObj["emit_"+sig]=function(){
				for(var slot in sigObj.__sigs__[sig])
				for(var j=0; j<sigObj.__sigs__[sig][slot].length; j++){
					var slotObj = sigObj.__sigs__[sig][slot][j]
					slotObj[slot].apply(slotObj,arguments);
				}	
			};
		}
	}
	else if(this.isStr(signal)){
		sigObj.__sigs__[signal]={};
		sigObj["emit_"+signal]=function(){
			for(var slot in sigObj.__sigs__[signal])
			for(var j=0; j<sigObj.__sigs__[signal][slot].length; j++){
				var slotObj = sigObj.__sigs__[signal][slot][j]
				slotObj[slot].apply(slotObj,arguments);
			}
		};
	}
};
exports.disconnect = function(sigObj, signal, slotObj, slot){

};

// ----- misc functions -----//
exports.is = function(it){
	return (it!==undefined || typeof it!="undefined");
};
exports.isObj = function(it){
	return this.is(it) &&(it===null||typeof it=="object"||this.isArr(it)||this.isFun(it));
};
exports.isArr = function(it){
	return (this.is(it) && it&&(it instanceof Array||typeof it=="array") );
};
exports.isFun = function(it){
	return (this.is(it) && Object.prototype.toString.call(it)==="[object Function]");
};
exports.isStr = function(it){
	return (this.is(it)&&(typeof it=="string"||it instanceof String));
};
exports.isDom = function(it){
	return (this.is(it) && it instanceof HTMLElement);
};
exports.isNum = function(it){
	return (this.is(it) && !isNaN(parseInt(it)));
};

exports.foreachInObj = function(obj,do_what){
	if(this.isObj(obj)){
		var tobj={};
		for(var x in obj)
		if((typeof tobj[x]=="undefined")||(tobj[x]!=obj[x]))
		if(trss.isFun(do_what)) do_what(x,obj[x]);
	}
	else return false;
};

exports.objToUrl = function(obj){
	if(!trss.isObj(obj)) return -1;
	var tobj={};
	var url="";
	for(var x in obj)
	if((typeof tobj[x]=="undefined")||(tobj[x]!=obj[x]))
	url+=(x+"="+encodeURIComponent(obj[x])+"&");
	url=url.substr(0,url.length-1);
	return url;
};

exports.trim = function(str, chars) {
	return this.ltrim(this.rtrim(str, chars), chars);
};
exports.ltrim = function(str, chars){
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
};
exports.rtrim = function(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
};

/*
ssubstr: function(token1, token2, off1, off2, inc){
	var s,e, t;
	if(this.isNum(token1)) s = token1;
	else if(this.isStr(token1)){
		s = str.indexOf(token1);
		if(off1) s+=(off1===true)?token1.length:((this.isNum(off1))?off1:0);
	}
	if(this.isNum(token2)) e = token2;	
	else if(this.isStr(token2)){ 
		e = str.indexOf(token2);
		if(off2) s+=(off2===true)?token2.length:((this.isNum(off2))?off2:0);
	}
	return (s!=-1&&e!=-1)?str.substring(s, (inc)?e+1:e):'';
};*/	

var cr=-1;
if(typeof(String.prototype.ssubstr)==="undefined"){
	String.prototype.ssubstr = function(token1, token2, off1, r, off2, inc){
		if(!r || r===undefined)cr=-1;
		
		var s,e, t;
		if(exports.isNum(token1)) s = token1;
		else if(exports.isStr(token1)){
			s = this.indexOf(token1, (r&&cr!=-1)?cr:0);
			if(off1&&s!=-1) s+=(off1===true)?token1.length:((exports.isNum(off1))?off1:0);
			if(r&&s!=-1) cr = s+1;
		}
		if(exports.isNum(token2)) e = token2;	
		else if(exports.isStr(token2)){ 
			e = this.indexOf(token2, (s!=-1)?s:0);
			if(off2&&e!=-1) e+=(off2===true)?token2.length:((exports.isNum(off2))?off2:0);
		}
		return (s!=-1&&e!=-1)?this.substring(s, (inc)?e+1:e):'';
	};
}

/*
var cstr, cn;
if(typeof(String.prototype.nl)==="undefined"){
	String.prototype.nl = function(){
		var result;
		if(cstr!=this){
			cn = -1;
			cstr = this;
			cn = this.indexOf('\n');
			result = this.substring(0, this.indexOf('\n'));
		}
	};
}*/


/*	
function Async(obj,delay,method,a0,a1,a2,a3,a4,a5,a6,a7,a8,a9){
this.id='async_'+(async.cCounter++);
this.obj=obj;
this.delay=delay;
this.timerId=0;
this.method=method;
this.a0=a0;this.a1=a1;this.a2=a2;this.a3=a3;this.a4=a4;
this.a5=a5;this.a6=a6;this.a7=a7;this.a8=a8;this.a9=a9;
Async.pendingCalls[this.id]=this;
}
Async.prototype.execute=function(){
this.obj[this.method](this.a0,this.a1,this.a2,this.a3,this.a4,this.a5,this.a6,this.a7,this.a8,this.a9);
delete Async.pendingCalls[this.id];
};
Async.prototype.cancel=function(){
clearTimeout(this.timerId);
delete Async.pendingCalls[this.id];
};
Async.prototype.asyncExecute=function(){
Async.pendingCalls[this.id].timerId=setTimeout("async.pendingCalls[\""+this.id+"\"].execute()",this.delay);
};
Async.cCounter=0;
Async.pendingCalls={};
*/
/*
if (typeof(Number.prototype.toRad) === "undefined"){
Number.prototype.toRad = function() {
return this * Math.PI / 180;
};
}
if (typeof(Number.prototype.toDeg) === "undefined") {
Number.prototype.toDeg = function() {
return this * 180 / Math.PI;
};
}

if (typeof(Number.prototype.precision) === "undefined") {
Number.prototype.precision = function(precision) {
if (isNaN(this)) return 'NaN';
var numb = this < 0 ? -this : this;  // can't take log of -ve number...
var sign = this < 0 ? '-' : '';

if (numb == 0) { n = '0.'; while (precision--) n += '0'; return n };  // can't take log of zero

var scale = Math.ceil(Math.log(numb)*Math.LOG10E);  // no of digits before decimal
var n = String(Math.round(numb * Math.pow(10, precision-scale)));
if (scale > 0) {  // add trailing zeros & insert decimal as required
l = scale - n.length;
while (l-- > 0) n = n + '0';
if (scale < n.length) n = n.slice(0,scale) + '.' + n.slice(scale);
} else {          // prefix decimal and leading zeros if required
while (scale++ < 0) n = '0' + n;
n = '0.' + n;
}
return sign + n;
};
}

if(typeof(Number.prototype.bound)==="undefined"){
Number.prototype.bound=function( min, max) {
var value=0;
if (min != null) value = Math.max(this, min);
if (max != null) value = Math.min(value, max);
return value;
};
}

if(typeof(Array.prototype.remove)==="undefined"){
Array.prototype.remove = function(from, to) {
var rest = this.slice((to || from) + 1 || this.length);
this.length = from < 0 ? this.length + from : from;
return this.push.apply(this, rest);
};
}

if(typeof(Array.prototype.insert)==="undefined"){

}

/*  -- pseudo-true inheritance function --  */
/*
this.$=function(po,co,ca){
if(trss.isObj(po)){
if(trss.isFun(co)){
if(ca!==undefined&&trss.isArr(ca))return(function(ca){(co).apply(po,ca);});
else return(function(ca){(co).call(po,ca);});
}
else if(trss.isObj(co)){co["parent"]=po; return co;}
}
}*/




