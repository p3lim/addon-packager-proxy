var fs = require('fs'),
	markdown = require('markdown').markdown;

var Utils = require('./utils');

var repo = 'git://git.curseforge.net/wow/%s/mainline.git';
module.exports.fetch = function(details, callback){
	Utils.Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.changelogPath;
			if(!fs.existsSync(filePath))
				callback(new Error(Utils.Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)))
			else {
				fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(err, data){
					if(err)
						callback(err);
					else
						callback(null, data);
				});
			}
		}
	});
}

module.exports.process = function(data){
	return Utils.HTMLToBBCode(markdown.toHTML(data));
}
