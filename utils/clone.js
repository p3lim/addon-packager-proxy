var Strings = require('./strings');

var spawn = require('child_process').spawn;
module.exports = function(repo, name, callback){
	var path = './tmp/' + name;

	var args = ['clone', '--'];
	args.push(repo);
	args.push(path);

	var process = spawn('git', args);
	process.on('close', function(status){
		if(status == 0)
			callback(null, path);
		else
			callback(new Error(Strings.CLONE_ERROR.replace('%s', status)));
	});
}