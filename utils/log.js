
module.exports = (function(){
	return {
		info: function(message){
			console.log('[LOG] ' + message);
		},
		error: function(message){
			console.log('[ERR] ' + message);
		}
	}
})();
