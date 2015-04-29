var Strings = require('./strings');

var fs = require('fs'),
	spawn = require('child_process').spawn;

var deleteDir = function(path){
	if(fs.existsSync(path)){
		fs.readdirSync(path).forEach(function(file, index){
			var curPath = path + '/' + file;
			if(fs.lstatSync(curPath).isDirectory()){
				deleteDir(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(path);
	}
}

module.exports = function(repo, name, callback){
	var path = './tmp/' + name;
	deleteDir(path);

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