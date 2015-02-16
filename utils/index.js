var Strings = module.exports.Strings = require('./strings');
module.exports.Log = require('./log');

var fs = require('fs'),
	Clone = require('./clone'),
	Log = new module.exports.Log();

var repo = 'git://git.curseforge.net/wow/%s/mainline.git';
module.exports.fetchChangelog = function(details, callback){
	Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.changelogPath;
			if(!fs.existsSync(filePath))
				callback(new Error(Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)))
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

var MarkdownToHTML = require('markdown').markdown.toHTML,
	HTMLToBBCode = require('./bbcode');

module.exports.formatChangelog = function(data){
	return HTMLToBBCode(MarkdownToHTML(data));
}
