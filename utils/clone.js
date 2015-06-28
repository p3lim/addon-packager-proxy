var Strings = require('./strings');

var fs = require('fs'),
	cp = require('child_process');

module.exports = function(repo, name, callback){
	var path = './tmp/' + name;
	if(fs.existsSync(path)){
		var fetch = cp.spawnSync('git', ['fetch', 'origin', 'master']);
		if(fetch.status == 0){
			var merge = cp.spawnSync('git', ['merge', 'origin/master']);
			if(merge.status == 0)
				callback(null, path);
			else
				callback(new Error(Strings.MERGE_ERROR.replace('%s', merge.status)));
		} else
			callback(new Error(Strings.FETCH_ERROR.replace('%s', fetch.status)));
	} else {
		var args = ['clone', '--'];
		args.push(repo);
		args.push(path);

		var process = cp.spawn('git', args);
		process.on('close', function(status){
			if(status == 0)
				callback(null, path);
			else
				callback(new Error(Strings.CLONE_ERROR.replace('%s', status)));
		});
	}
}