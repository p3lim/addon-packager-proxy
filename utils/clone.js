var Strings = require('./strings');

var fs = require('fs'),
	cp = require('child_process');

module.exports = function(repo, name, callback){
	var path = './tmp/' + name;
	fs.stat(path, function(err, stats){
		if(stats && stats.isDirectory()){
			var fetch = cp.spawn('git', ['fetch', 'origin', 'master'], {cwd: path});
			fetch.on('close', function(fstatus){
				if(fstatus == 0){
					var merge = cp.spawn('git', ['merge', 'origin/master'], {cwd: path});
					merge.on('close', function(mstatus){
						if(mstatus == 0)
							callback(null, path);
						else
							callback(new Error(Strings.MERGE_ERROR.replace('%s', mstatus)));
					});
				} else
					callback(new Error(Strings.FETCH_ERROR.replace('%s', fstatus)));
			});
		} else if(!stats) {
			var process = cp.spawn('git', ['clone', '--', repo, path]);
			process.on('close', function(status){
				if(status == 0)
					callback(null, path);
				else
					callback(new Error(Strings.CLONE_ERROR.replace('%s', status)));
			});
		} else
			callback(err);
	});
}
