//META{"name":"BetterAPI"}*//
BetterAPI = function() {
	this.getName = function(){ return "BetterAPI"; }
	this.getDescription = function(){ return "Enhances the BetterDiscord Plugin API."; }
	this.getVersion = function(){ return "1.0"; }
	this.getAuthor = function(){ return "Bluscream"; }
};
BetterAPI.prototype.load = function() {
	$("<script/>",{ type: "text/javascript", src: "https://cdn.rawgit.com/Bluscream/BetterDiscord-Plugins-and-Themes/indev/dist/BetterAPI.min.js", id: "BetterAPI" }).appendTo($("head"));
};
BetterAPI.prototype.start = function() {};
BetterAPI.prototype.update = function() {};
BetterAPI.prototype.onMessage = function() {};
BetterAPI.prototype.getSettingsPanel = function() {
	$('#bdpmakebak').livequery(function(){
		$('#bdpmakebak').click( function() { BetterAPI.makeFile('bdbackup.txt', BetterAPI.getBackup()); });
	});
	$('#bdprestbak').livequery(function(){
		$('#bdprestbak').upload({
			name: 'bdprestbakform',
			onComplete: function(response) { alertify.success(""+response); }
		});
	});
	$('#bdpreload').livequery(function(){
		$('#bdpreload').click( function() { window.location.reload(); });
	});
	return '<b>BetterAPI Settings</b><br><br><br>'+
		'Backup Localstorage:&nbsp;<button id="bdpmakebak">Backup</button><br>'+
		'Restore Localstorage:&nbsp;<button id="bdprestbak">Restore</button><br>'+
		'Reload Discord:&nbsp;<button id="bdpreload">Reload</button><br>';
};
BetterAPI.prototype.onSwitch = function() {
	localStorage.setItem('URL', window.location.href);
	if(BetterAPI.elemExists('a[data-reactid=".0.1.1.0.1.0.0.1.2.0"]', 2)){
		$('a[data-reactid=".0.1.1.0.1.0.0.1.2.0"]:first').parent().remove();
	}
};
BetterAPI.prototype.stop = function() {};
BetterAPI.prototype.unload = function() {};
try{exports.BetterAPI = BetterAPI;}catch(e){console.warn('Using old version, not exporting functions.');}