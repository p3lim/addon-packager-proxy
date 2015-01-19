module.exports = function(){
	return {
		info: function(message){
			if(this.id)
				console.log('[LOG.' + this.id + '] ' + message);
			else
				console.log('[LOG] ' + message);
		},
		error: function(message){
			if(this.id)
				console.log('[ERR.' + this.id + '] ' + message);
			else
				console.log('[ERR] ' + message);
		},
		setID: function(id){
			this.id = id;
		}
	}
};
